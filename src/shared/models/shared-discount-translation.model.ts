import { z } from 'zod'

export const DiscountTranslationSchema = z.object({
  id: z.number(),
  discountId: z.number(),
  languageId: z.string(),
  name: z.string(),
  description: z.string(),
  createdById: z.number().nullable(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export type DiscountTranslationType = z.infer<typeof DiscountTranslationSchema>
