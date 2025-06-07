import { createZodDto } from 'nestjs-zod'
import {
  LoginBodySchema,
  LogoutBodySchema,
  RefreshTokenBodySchema,
  TokenResSchema,
  RegisterResSchema,
  SendOTPBodySchema,
  GoogleAuthUrlResSchema,
} from './auth.model'
import { RegisterBodySchema } from './auth.model'

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}
export class RegisterResDTO extends createZodDto(RegisterResSchema) {}
export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}
export class TokenResDTO extends createZodDto(TokenResSchema) {}
export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {}
export class LogoutBodyDTO extends createZodDto(LogoutBodySchema) {}
export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}
export class GoogleAuthUrlResDTO extends createZodDto(GoogleAuthUrlResSchema) {}
