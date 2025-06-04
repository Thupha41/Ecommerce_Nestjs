import z from 'zod'
import { UserStatus } from '../constants/auth.constants'

export const UserSchema = z.object({
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

export type UserType = z.infer<typeof UserSchema>
