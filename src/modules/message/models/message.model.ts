import { OrderBy } from 'src/shared/constants/other.constant'
import { MessageSchema } from 'src/shared/models/shared-message.model'
import { UserSchema } from 'src/shared/models/shared-user.model'
import { z } from 'zod'

export const GetMessagesQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().default(10),
  fromUserId: z.coerce.number().int().positive().optional(),
  orderBy: z.enum([OrderBy.Asc, OrderBy.Desc]).default(OrderBy.Desc),
  sortBy: z.enum(['createdAt']).default('createdAt'),
})

export const GetMessagesResSchema = z.object({
  items: z.array(
    MessageSchema.extend({
      fromUser: UserSchema.pick({
        id: true,
        name: true,
        email: true,
        avatar: true,
      }),
    }),
  ),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const CreateMessageBodySchema = z.object({
  content: z.string().min(1),
  metadata: z.record(z.any()).optional(),
}).strict()

export const CreateMessageResSchema = MessageSchema.extend({
  fromUser: UserSchema.pick({
    id: true,
    name: true,
    email: true,
    avatar: true,
  }),
})

export type GetMessagesQueryType = z.infer<typeof GetMessagesQuerySchema>
export type GetMessagesResType = z.infer<typeof GetMessagesResSchema>
export type CreateMessageBodyType = z.infer<typeof CreateMessageBodySchema>
export type CreateMessageResType = z.infer<typeof CreateMessageResSchema>

