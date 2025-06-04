import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common'
import { AuthService } from './auth.service'
import { UseGuards } from '@nestjs/common'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  RegisterBodyType,
  LoginBodyType,
  RefreshTokenBodyType,
  LogoutBodyType,
  RegisterResSchema,
  TokenResSchema,
} from './auth.model'
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /*
    Khi endpoint POST /register được gọi, decorator @SerializeOptions({ type: RegisterResDTO }) 
    chỉ định rằng response cần được serialize theo cấu trúc của RegisterResDTO.
  */
  // @SerializeOptions({ type: RegisterResDTO })
  @Post('register')
  @ZodSerializerDto(RegisterResSchema)
  async register(@Body() body: RegisterBodyType) {
    return await this.authService.register(body)
  }

  @Post('login')
  @ZodSerializerDto(TokenResSchema)
  async login(@Body() body: LoginBodyType) {
    return await this.authService.login(body)
  }

  @Post('refresh-token')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  @ZodSerializerDto(TokenResSchema)
  async refreshToken(@Body() body: RefreshTokenBodyType) {
    return await this.authService.refreshToken(body)
  }

  @Post('logout')
  @UseGuards(AccessTokenGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Body() body: LogoutBodyType) {
    return await this.authService.logout(body)
  }
}
