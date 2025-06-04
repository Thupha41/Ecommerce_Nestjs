import { UserStatus } from 'src/shared/constants/auth.constants'
import { z } from 'zod'

const UserSchema = z.object({
  id: z.number(),
  email: z.string().email(),
  name: z.string().min(1).max(100),
  password: z.string().min(8).max(100),
  phoneNumber: z
    .string()
    .min(10, { message: 'Phone number must be at least 10 digits' })
    .max(11, { message: 'Phone number must not exceed 11 digits' })
    .regex(/^(0|\+84)\d{9,10}$/, { message: 'Invalid phone number format' }),
  avatar: z.string().nullable(),
  totpSecret: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED, UserStatus.INACTIVE]),
  roleId: z.number().positive(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
})

const TokenSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
})

export type UserType = z.infer<typeof UserSchema>
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
