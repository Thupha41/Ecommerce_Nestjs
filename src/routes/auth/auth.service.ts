import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common'
import { HashingService } from 'src/shared/services/hashing.service'
import { TokenService } from 'src/shared/services/token.service'
import { isUniqueConstraintError, isNotFoundError, generateOTP } from 'src/shared/helpers'
import { RolesService } from './role.service'
import { RefreshTokenBodyType, LogoutBodyType, RegisterBodyType, SendOTPBodyType } from './auth.model'
import { IAuthRepository } from './repository/auth.repo.interface'
import { ISharedUserRepository } from 'src/shared/repositories/shared-user.repo.interface'
import { addMilliseconds } from 'date-fns'
import ms from 'ms'
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constants'
import { EmailService } from 'src/shared/services/email.service'
import { IAccessTokenPayloadCreate } from 'src/shared/types/jwt.types'
@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly tokenService: TokenService,
    private readonly roleService: RolesService,
    private readonly emailService: EmailService,
    @Inject('IAuthRepository') private readonly authRepository: IAuthRepository,
    @Inject('ISharedUserRepository') private readonly sharedUserRepository: ISharedUserRepository,
  ) {}

  async register(body: RegisterBodyType) {
    try {
      const verificationCode = await this.authRepository.findUniqueVerificationCode({
        email: body.email,
        type: TypeOfVerificationCode.REGISTER,
        code: body.code,
      })

      if (!verificationCode) {
        throw new UnprocessableEntityException([
          {
            field: 'code',
            error: 'Invalid verification code',
          },
        ])
      }
      if (verificationCode.expiresAt < new Date()) {
        throw new UnprocessableEntityException([
          {
            field: 'code',
            error: 'Verification code has expired',
          },
        ])
      }
      const clientRoleId = await this.roleService.getClientRoleId()
      const hashingPassword = await this.hashingService.hash(body.password)

      return await this.authRepository.createUser({
        name: body.name,
        email: body.email,
        password: hashingPassword,
        phoneNumber: body.phoneNumber,
        roleId: clientRoleId,
      })
    } catch (error) {
      console.log('>>> check register error', error)
      if (isUniqueConstraintError(error)) {
        if (error.meta?.target instanceof Array && error.meta.target[0] === 'email') {
          throw new ConflictException([
            {
              message: 'Email already exists',
              path: 'email',
            },
          ])
        }
      }
      throw error
    }
  }

  async login(body: any) {
    //1> check email exist in db
    const checkEmailExist = await this.authRepository.findUserUniqueUserIncludeRole({ email: body.email })
    if (!checkEmailExist) {
      throw new UnauthorizedException('Email not found')
    }

    //2 > check password is match in db
    const isPassMatch = await this.hashingService.compare(body.password, checkEmailExist.password)
    if (!isPassMatch) {
      throw new UnprocessableEntityException([
        {
          field: 'password',
          error: 'Password is incorrect',
        },
      ])
    }

    //3> Create Device
    const device = await this.authRepository.createDevice({
      userId: checkEmailExist.id,
      userAgent: body.userAgent,
      ip: body.ip,
    })

    if (!device) {
      throw new Error('Failed to create device')
    }

    //4> Create token
    const token = await this.generateTokens({
      userId: checkEmailExist.id,
      deviceId: device.id,
      roleId: checkEmailExist.roleId,
      roleName: checkEmailExist.role.name,
    })

    return token
  }

  async generateTokens(payload: IAccessTokenPayloadCreate) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken({
        userId: payload.userId,
        roleId: payload.roleId,
        roleName: payload.roleName,
        deviceId: payload.deviceId,
      }),
      this.tokenService.signRefreshToken({
        userId: payload.userId,
      }),
    ])

    const decodeRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)

    await this.authRepository.createRefreshToken(
      refreshToken,
      payload.userId,
      new Date(decodeRefreshToken.exp * 1000),
      payload.deviceId,
    )

    return {
      accessToken,
      refreshToken,
    }
  }

  async refreshToken({ refreshToken, ip, userAgent }: RefreshTokenBodyType & { ip: string; userAgent: string }) {
    try {
      //1. verify refresh token
      const { userId } = await this.tokenService.verifyRefreshToken(refreshToken)

      //2. check refresh token exist
      const checkRefreshTokenExist = await this.authRepository.findUniqueRefreshTokenIncludeUserRole({
        token: refreshToken,
      })
      if (!checkRefreshTokenExist) {
        throw new UnauthorizedException('Refresh token has been revoked')
      }

      //3. Cập nhật device
      const {
        deviceId,
        user: { roleId, name: roleName },
      } = checkRefreshTokenExist

      const $updateDevice = await this.authRepository.updateDevice(deviceId, {
        ip,
        userAgent,
      })

      //4. xóa refresh token cũ
      const $deleteRefreshToken = await this.authRepository.deleteRefreshToken({ token: refreshToken })

      //4. tạo token mới
      const $tokens = this.generateTokens({
        userId,
        deviceId,
        roleId,
        roleName,
      })

      const [, , tokens] = await Promise.all([$updateDevice, $deleteRefreshToken, $tokens])

      return tokens
    } catch (error) {
      console.log('>>> check refresh token error', error)
      if (isNotFoundError(error)) {
        throw new UnauthorizedException('Refresh has been revoked')
      }
      throw new UnauthorizedException('Refresh token not found')
    }
  }

  async logout(body: LogoutBodyType) {
    try {
      //1. verify refresh token
      await this.tokenService.verifyRefreshToken(body.refreshToken)

      //2. check refresh token exist
      const checkRefreshTokenExist = await this.authRepository.findRefreshToken(body.refreshToken)
      if (!checkRefreshTokenExist) {
        throw new UnauthorizedException('Refresh token not found')
      }
      //3. xóa refresh token cũ
      const $deleteRefreshToken = await this.authRepository.deleteRefreshToken({ token: body.refreshToken })

      //4. Cập nhật device là đã logout
      if ($deleteRefreshToken && $deleteRefreshToken.deviceId) {
        await this.authRepository.updateDevice($deleteRefreshToken.deviceId, {
          isActive: false,
        })
      }

      return {
        message: 'Logout successfully',
      }
    } catch (error) {
      console.log('>>> check refresh token error', error)
      if (isNotFoundError(error)) {
        throw new UnauthorizedException('Refresh has been revoked')
      }
      throw new UnauthorizedException('Refresh token not found')
    }
  }

  async sendOTP(body: SendOTPBodyType) {
    const { email, type } = body
    //1. check email exist
    const checkEmailExist = await this.sharedUserRepository.findUserUnique({ email })
    if (checkEmailExist) {
      throw new ConflictException([
        {
          message: 'Email already exists',
          path: 'email',
        },
      ])
    }

    //2. Generate OTP
    const otp = generateOTP(6)
    const verificationCode = await this.authRepository.createVerificationCode({
      email,
      code: otp,
      type,
      expiresAt: addMilliseconds(new Date(), ms('5m')),
    })

    //3. Send OTP to email
    const { error } = await this.emailService.sendOTPCodeEmail({ email, code: otp })

    if (error) {
      throw new UnprocessableEntityException({
        message: 'Send OTP failed',
        path: 'code',
      })
    }

    return {
      message: 'OTP sent successfully',
      verificationCode,
    }
  }
}
