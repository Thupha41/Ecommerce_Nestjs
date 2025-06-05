import { Controller, Post, Body, HttpCode, HttpStatus, Ip } from '@nestjs/common'
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
} from './auth.dto'
import { UserAgent } from 'src/shared/decorators/user-agent.decorator'

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /*
    Khi endpoint POST /register được gọi, decorator @SerializeOptions({ type: RegisterResDTO }) 
    chỉ định rằng response cần được serialize theo cấu trúc của RegisterResDTO.
  */
  // @SerializeOptions({ type: RegisterResDTO })
  @Post('register')
  @ZodSerializerDto(RegisterResDTO)
  async register(@Body() body: RegisterBodyDTO) {
    return await this.authService.register(body)
  }

  @Post('login')
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
  @HttpCode(HttpStatus.OK)
  async sendOTP(@Body() body: SendOTPBodyDTO) {
    return await this.authService.sendOTP(body)
  }
}
