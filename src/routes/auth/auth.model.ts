import { TypeOfVerificationCode } from 'src/shared/constants/auth.constants'
import { z } from 'zod'
import { UserSchema } from 'src/shared/models/shared-user.model'

export const VerificationCodeSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  code: z.string().length(6),
  type: z.enum([TypeOfVerificationCode.REGISTER, TypeOfVerificationCode.FORGOT_PASSWORD]),
  expiresAt: z.date(),
  createdAt: z.date(),
})

const TokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

/*
  1. Strict: Kiểm tra tất cả các trường được định nghĩa trong schema.
  Nếu có trường nào không khớp với schema, sẽ ném ra lỗi.
  2. superRefine: Nhận vào callback function, callback function nhận vào 2 tham số:
  - confirmPassword: password được nhập vào
  - password: password được nhập vào
  - ctx: context của zod
  - Nếu confirmPassword không khớp với password, sẽ ném ra lỗi.
*/
export const RegisterBodySchema = UserSchema.pick({
  email: true,
  name: true,
  password: true,
  phoneNumber: true,
})
  .extend({
    confirmPassword: z
      .string()
      .min(8, { message: 'Confirm password must be at least 8 characters' })
      .max(100, { message: 'Confirm password is too long' }),
  })
  .strict()
  .superRefine(({ confirmPassword, password }, ctx) => {
    if (confirmPassword !== password) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Password and confirm password do not match',
        path: ['confirmPassword'],
      })
    }
  })

export const SendOTPBodySchema = VerificationCodeSchema.pick({
  email: true,
  type: true,
})
  .strict()
  .superRefine(({ type }, ctx) => {
    if (type !== TypeOfVerificationCode.REGISTER && type !== TypeOfVerificationCode.FORGOT_PASSWORD) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Invalid verification code type', path: ['type'] })
    }
  })

export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>

export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})

export type RegisterResType = z.infer<typeof RegisterResSchema>

export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
})

export type LoginBodyType = z.infer<typeof LoginBodySchema>

export const TokenResSchema = TokenSchema

export type TokenResType = z.infer<typeof TokenResSchema>

export const RefreshTokenBodySchema = TokenSchema.pick({
  refreshToken: true,
})

export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>

export const LogoutBodySchema = TokenSchema.pick({
  refreshToken: true,
})

export type LogoutBodyType = z.infer<typeof LogoutBodySchema>

export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>
