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

const refreshTokenSchema = z.object({
  token: z.string(),
  userId: z.number(),
  deviceId: z.number(),
  createdAt: z.date(),
  expiresAt: z.date(),
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
    code: z.string().length(6),
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

export const RegisterResSchema = UserSchema.omit({
  password: true,
  totpSecret: true,
})

export const LoginBodySchema = UserSchema.pick({
  email: true,
  password: true,
}).strict()

export const RefreshTokenBodySchema = TokenSchema.pick({
  refreshToken: true,
})

export const LogoutBodySchema = TokenSchema.pick({
  refreshToken: true,
})

export const DeviceSchema = z.object({
  id: z.number(),
  userId: z.number(),
  userAgent: z.string(),
  ip: z.string(),
  lastActiveAt: z.date().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
})

export type DeviceType = z.infer<typeof DeviceSchema>

export const RoleSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  isActive: z.boolean(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export const GoogleAuthStateSchema = DeviceSchema.pick({
  userAgent: true,
  ip: true,
})

export const GoogleAuthUrlResSchema = z.object({
  url: z.string(),
})

export type RoleType = z.infer<typeof RoleSchema>

export type LogoutBodyType = z.infer<typeof LogoutBodySchema>

export type VerificationCodeType = z.infer<typeof VerificationCodeSchema>

export type LoginBodyType = z.infer<typeof LoginBodySchema>

export const TokenResSchema = TokenSchema

export type TokenResType = z.infer<typeof TokenResSchema>

export type RegisterResType = z.infer<typeof RegisterResSchema>

export type RefreshTokenBodyType = z.infer<typeof RefreshTokenBodySchema>

export type SendOTPBodyType = z.infer<typeof SendOTPBodySchema>

export type RegisterBodyType = z.infer<typeof RegisterBodySchema>

export type RefreshTokenType = z.infer<typeof refreshTokenSchema>

export type GoogleAuthStateType = z.infer<typeof GoogleAuthStateSchema>

export type GoogleAuthUrlResType = z.infer<typeof GoogleAuthUrlResSchema>
