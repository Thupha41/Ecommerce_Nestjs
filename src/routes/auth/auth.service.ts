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
import { LoginBodyType, RefreshTokenBodyType, LogoutBodyType, RegisterBodyType, SendOTPBodyType } from './auth.model'
import { IAuthRepository } from './repository/auth.repo.interface'
import { ISharedUserRepository } from 'src/shared/repositories/shared-user.repo.interface'
import { addMilliseconds } from 'date-fns'
import ms from 'ms'
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constants'
import { EmailService } from 'src/shared/services/email.service'
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

  async login(body: LoginBodyType) {
    //check email exist in db
    const checkEmailExist = await this.sharedUserRepository.findUserUnique({ email: body.email })
    if (!checkEmailExist) {
      throw new UnauthorizedException('Email not found')
    }

    //check password is match in db
    const isPassMatch = await this.hashingService.compare(body.password, checkEmailExist.password)
    // if (!isPassMatch) throw new UnauthorizedException('Password does not match, please try again')

    if (!isPassMatch) {
      throw new UnprocessableEntityException([
        {
          field: 'password',
          error: 'Password is incorrect',
        },
      ])
    }

    const token = await this.generateTokens({ userId: checkEmailExist.id })

    return token
  }

  async generateTokens(payload: { userId: number }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(payload),
      this.tokenService.signRefreshToken(payload),
    ])

    const decodeRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)

    await this.authRepository.createRefreshToken(refreshToken, payload.userId, new Date(decodeRefreshToken.exp * 1000))

    return {
      accessToken,
      refreshToken,
    }
  }

  async refreshToken(body: RefreshTokenBodyType) {
    try {
      //verify refresh token
      const { userId } = await this.tokenService.verifyRefreshToken(body.refreshToken)

      //check refresh token exist
      const checkRefreshTokenExist = await this.authRepository.findRefreshToken(body.refreshToken)
      if (!checkRefreshTokenExist) {
        throw new UnauthorizedException('Refresh token not found')
      }
      //xóa refresh token cũ
      await this.authRepository.deleteRefreshToken(body.refreshToken)

      //tạo token mới
      const token = await this.generateTokens({ userId })

      return token
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
      //verify refresh token
      await this.tokenService.verifyRefreshToken(body.refreshToken)

      //check refresh token exist
      const checkRefreshTokenExist = await this.authRepository.findRefreshToken(body.refreshToken)
      if (!checkRefreshTokenExist) {
        throw new UnauthorizedException('Refresh token not found')
      }
      //xóa refresh token cũ
      await this.authRepository.deleteRefreshToken(body.refreshToken)

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
