import { z } from 'zod'

export const EmptyBodySchema = z.object({}).strict()

export const PaginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1), // Phải thêm coerce để chuyển từ string sang number
  limit: z.coerce.number().int().positive().default(10), // Phải thêm coerce để chuyển từ string sang number
  lang: z.string().default('en'),
})

export type EmptyBodyType = z.infer<typeof EmptyBodySchema>
export type PaginationQueryType = z.infer<typeof PaginationQuerySchema>
