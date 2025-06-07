import z from 'zod'
import { UserStatus } from '../constants/auth.constants'

export const UserSchema = z.object({
  id: z.number(),
  email: z.string({ message: 'Error.InvalidEmail' }).email({ message: 'Error.InvalidEmail' }),
  name: z.string().min(1, { message: 'Error.InvalidName' }).max(100, { message: 'Error.InvalidName' }),
  password: z.string().min(8, { message: 'Error.InvalidPassword' }).max(100, { message: 'Error.InvalidPassword' }),
  phoneNumber: z
    .string()
    .min(10, { message: 'Error.InvalidPhoneNumber' })
    .max(11, { message: 'Error.InvalidPhoneNumber' })
    .regex(/^(0|\+84)\d{9,10}$/, { message: 'Error.InvalidPhoneNumber' }),
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

export type UserType = z.infer<typeof UserSchema>
