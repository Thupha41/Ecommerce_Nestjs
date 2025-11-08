import { z } from 'zod'

export const MessageSchema = z.object({
  id: z.number(),
  fromUserId: z.number(),
  content: z.string(),
  metadata: z.record(z.any()).nullable(),
  createdAt: z.date(),
})

export type MessageType = z.infer<typeof MessageSchema>

