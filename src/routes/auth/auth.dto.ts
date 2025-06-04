import { UserStatus } from '@prisma/client'
import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'

const UserSchema = z.object({
  id: z.number(),
  email: z.string(),
  name: z.string(),
  phoneNumber: z.string(),
  avatar: z.string().nullable(),
  status: z.enum([UserStatus.ACTIVE, UserStatus.BLOCKED]),
  roleId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
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
const RegisterBodySchema = z
  .object({
    email: z.string().email(),
    name: z.string().min(1),
    password: z.string().min(8).max(100),
    confirmPassword: z.string().min(8).max(100),
    phoneNumber: z.string().min(10).max(11),
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

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}
export class RegisterResDto extends createZodDto(UserSchema) {}
