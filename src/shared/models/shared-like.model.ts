import { z } from 'zod'

export const LikeSchema = z.object({
  id: z.number(),
  userId: z.number(),
  productId: z.number(),
  createdAt: z.date(),
})

export type LikeType = z.infer<typeof LikeSchema>

