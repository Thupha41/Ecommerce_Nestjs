import { Inject, Injectable } from '@nestjs/common'
import { HashingService } from 'src/shared/services/hashing.service'
import { TokenService } from 'src/shared/services/token.service'
import { isUniqueConstraintError, isNotFoundError, generateOTP } from 'src/shared/helpers'
import { RolesService } from './role.service'
import { RefreshTokenBodyType, LogoutBodyType, RegisterBodyType, SendOTPBodyType } from './models/auth.model'
import { IAuthRepository } from './repository/auth.repo.interface'
import { ISharedUserRepository } from 'src/shared/repositories/shared-user.repo.interface'
import { addMilliseconds } from 'date-fns'
import ms from 'ms'
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constants'
import { EmailService } from 'src/shared/services/email.service'
import { IAccessTokenPayloadCreate } from 'src/shared/types/jwt.types'
import {
  EmailAlreadyExistsException,
  EmailNotFoundException,
  FailedToCreateDeviceException,
  FailedToSendOTPException,
  InvalidOTPException,
  OTPExpiredException,
  PasswordIncorrectException,
  RefreshTokenAlreadyUsedException,
  RefreshTokenNotFoundException,
} from './models/error.model'
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
        throw InvalidOTPException
      }
      if (verificationCode.expiresAt < new Date()) {
        throw OTPExpiredException
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
          throw EmailAlreadyExistsException
        }
      }
      throw error
    }
  }
  async createDeviceAndTokens(userId: number, roleId: number, roleName: string, userAgent: string, ip: string) {
    const device = await this.authRepository.createDevice({
      userId,
      userAgent,
      ip,
    })

    if (!device) {
      throw FailedToCreateDeviceException
    }

    return this.generateTokens({
      userId,
      deviceId: device.id,
      roleId,
      roleName,
    })
  }
  async login(body: any) {
    //1> check email exist in db
    const checkEmailExist = await this.authRepository.findUserUniqueUserIncludeRole({ email: body.email })
    if (!checkEmailExist) {
      throw EmailNotFoundException
    }

    //2 > check password is match in db
    const isPassMatch = await this.hashingService.compare(body.password, checkEmailExist.password)
    if (!isPassMatch) {
      throw PasswordIncorrectException
    }

    return this.createDeviceAndTokens(
      checkEmailExist.id,
      checkEmailExist.roleId,
      checkEmailExist.role.name,
      body.userAgent,
      body.ip,
    )
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
        throw RefreshTokenAlreadyUsedException
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
        throw RefreshTokenAlreadyUsedException
      }
      throw RefreshTokenAlreadyUsedException
    }
  }

  async logout(body: LogoutBodyType) {
    try {
      //1. verify refresh token
      await this.tokenService.verifyRefreshToken(body.refreshToken)

      //2. check refresh token exist
      const checkRefreshTokenExist = await this.authRepository.findRefreshToken(body.refreshToken)
      if (!checkRefreshTokenExist) {
        throw RefreshTokenNotFoundException
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
        throw RefreshTokenAlreadyUsedException
      }
      throw RefreshTokenNotFoundException
    }
  }

  async sendOTP(body: SendOTPBodyType) {
    const { email, type } = body
    //1. check email exist
    const checkEmailExist = await this.sharedUserRepository.findUserUnique({ email })
    if (checkEmailExist) {
      throw EmailAlreadyExistsException
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
      throw FailedToSendOTPException
    }

    return {
      message: 'OTP sent successfully',
      verificationCode,
    }
  }
}
