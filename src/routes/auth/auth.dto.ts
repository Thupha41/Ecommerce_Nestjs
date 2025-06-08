import { createZodDto } from 'nestjs-zod'
import {
  LoginBodySchema,
  LogoutBodySchema,
  RefreshTokenBodySchema,
  TokenResSchema,
  RegisterResSchema,
  SendOTPBodySchema,
  GoogleAuthUrlResSchema,
  ForgotPasswordBodySchema,
  Disable2FABodySchema,
  TwoFactorSetupResSchema,
} from './models/auth.model'
import { RegisterBodySchema } from './models/auth.model'

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}
export class RegisterResDTO extends createZodDto(RegisterResSchema) {}
export class LoginBodyDTO extends createZodDto(LoginBodySchema) {}
export class TokenResDTO extends createZodDto(TokenResSchema) {}
export class RefreshTokenBodyDTO extends createZodDto(RefreshTokenBodySchema) {}
export class LogoutBodyDTO extends createZodDto(LogoutBodySchema) {}
export class SendOTPBodyDTO extends createZodDto(SendOTPBodySchema) {}
export class GoogleAuthUrlResDTO extends createZodDto(GoogleAuthUrlResSchema) {}
export class ForgotPasswordBodyDTO extends createZodDto(ForgotPasswordBodySchema) {}
export class Disable2FABodyDTO extends createZodDto(Disable2FABodySchema) {}
export class TwoFactorSetupResDTO extends createZodDto(TwoFactorSetupResSchema) {}
