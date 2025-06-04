import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UseGuards } from '@nestjs/common'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import {
  LoginBodyDTO,
  LoginResDto,
  RegisterBodyDTO,
  RegisterResDto,
  LogoutBodyDTO,
  RefreshTokenBodyDTO,
  RefreshTokenResDto,
} from './auth.dto'
import { ZodSerializerDto } from 'nestjs-zod'
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /*
    Khi endpoint POST /register được gọi, decorator @SerializeOptions({ type: RegisterResDTO }) 
    chỉ định rằng response cần được serialize theo cấu trúc của RegisterResDTO.
  */
  // @SerializeOptions({ type: RegisterResDTO })
  @Post('register')
  @ZodSerializerDto(RegisterResDto)
  async register(@Body() body: RegisterBodyDTO) {
    return await this.authService.register(body)
  }

  @Post('login')
  @ZodSerializerDto(LoginResDto)
  async login(@Body() body: LoginBodyDTO) {
    return await this.authService.login(body)
  }

  @Post('refresh-token')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(RefreshTokenResDto)
  async refreshToken(@Body() body: RefreshTokenBodyDTO) {
    return await this.authService.refreshToken(body)
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: LogoutBodyDTO) {
    return await this.authService.logout(body)
  }
}
