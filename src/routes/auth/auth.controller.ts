import { Controller, Post, Body, HttpCode, HttpStatus, Ip, Get, Query, Res } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UseGuards } from '@nestjs/common'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  LoginBodyDTO,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RegisterBodyDTO,
  RegisterResDTO,
  SendOTPBodyDTO,
  TokenResDTO,
  GoogleAuthUrlResDTO,
  ForgotPasswordBodyDTO,
  TwoFactorSetupResDTO,
} from './auth.dto'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { GoogleService } from './google.service'
import envConfig from 'src/shared/config'
import { Response } from 'express'
import { EmptyBodyDTO } from 'src/shared/dtos/request.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleService: GoogleService,
  ) {}

  /*
    Khi endpoint POST /register được gọi, decorator @SerializeOptions({ type: RegisterResDTO }) 
    chỉ định rằng response cần được serialize theo cấu trúc của RegisterResDTO.
  */
  // @SerializeOptions({ type: RegisterResDTO })
  @Post('register')
  @IsPublic()
  @ZodSerializerDto(RegisterResDTO)
  async register(@Body() body: RegisterBodyDTO) {
    return await this.authService.register(body)
  }

  @Post('login')
  @IsPublic()
  @ZodSerializerDto(TokenResDTO)
  async login(@Body() body: LoginBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return await this.authService.login({ ...body, userAgent, ip })
  }

  @Post('refresh-token')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(TokenResDTO)
  async refreshToken(@Body() body: RefreshTokenBodyDTO, @UserAgent() userAgent: string, @Ip() ip: string) {
    return await this.authService.refreshToken({ ...body, userAgent, ip })
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: LogoutBodyDTO) {
    return await this.authService.logout(body)
  }

  @Post('otp')
  @ZodSerializerDto(MessageResDTO)
  @HttpCode(HttpStatus.OK)
  async sendOTP(@Body() body: SendOTPBodyDTO) {
    return await this.authService.sendOTP(body)
  }

  @Get('google-link')
  @IsPublic()
  @ZodSerializerDto(GoogleAuthUrlResDTO)
  getAuthorizationUrl(@UserAgent() userAgent: string, @Ip() ip: string) {
    return this.googleService.getAuthorizationUrl({ userAgent, ip })
  }

  @Get('google/callback')
  @IsPublic()
  @ZodSerializerDto(GoogleAuthUrlResDTO)
  async googleCallBack(@Query('code') code: string, @Query('state') state: string, @Res() res: Response) {
    try {
      const data = await this.googleService.googleCallBack({ code, state })
      return res.redirect(
        `${envConfig.GOOGLE_REDIRECT_URI}?accessToken=${data.accessToken}&refreshToken=${data.refreshToken}`,
      )
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to login with google'
      console.error('Error in googleCallBack', error)
      return res.redirect(`${envConfig.GOOGLE_REDIRECT_URI}?errorMessage=${message}`)
    }
  }

  @Post('forgot-password')
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  async forgotPassword(@Body() body: ForgotPasswordBodyDTO) {
    return await this.authService.forgotPassword(body)
  }

  @Post('2fa/setup')
  @UseGuards(AccessTokenGuard)
  @ZodSerializerDto(TwoFactorSetupResDTO)
  async setup2FA(@Body() _: EmptyBodyDTO, @ActiveUser('userId') userId: number) {
    return await this.authService.setup2FA(userId)
  }
}
