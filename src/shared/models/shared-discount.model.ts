import { z } from 'zod'
import { DiscountTranslationSchema } from './shared-discount-translation.model'
import { DiscountType, DiscountApplyTo } from 'src/shared/constants/discount.constants'
export const DiscountSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string(),
  value: z.union([z.number(), z.string(), z.instanceof(Object).transform((val) => Number(val))]),
  type: z.enum([DiscountType.PERCENTAGE, DiscountType.FIXED]),
  code: z.string(),
  maxUses: z.number(),
  minQuantity: z.number(),
  usedCount: z.number(),
  maxUsesPerUser: z.number(),
  startDate: z.coerce.date().nullable(),
  endDate: z.coerce.date().nullable(),
  minOrderValue: z.union([z.number(), z.string(), z.instanceof(Object).transform((val) => Number(val))]),
  applyTo: z.enum([DiscountApplyTo.ALL, DiscountApplyTo.SPECIFIC]),
  isActive: z.boolean(),
  createdById: z.number(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  deletedAt: z.date().nullable(),
  createdAt: z.date(),
  updatedAt: z.date(),
  //   skus: z.array(z.number()),
  //   orders: z.array(z.number()),
})

export const DiscountIncludeTranslationSchema = DiscountSchema.extend({
  discountTranslations: z.array(DiscountTranslationSchema),
})

export type DiscountType = z.infer<typeof DiscountSchema>
export type DiscountIncludeTranslationType = z.infer<typeof DiscountIncludeTranslationSchema>
