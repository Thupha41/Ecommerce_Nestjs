import { DiscountTranslationSchema } from 'src/shared/models/shared-discount-translation.model'
import { z } from 'zod'

export const GetDiscountTranslationParamsSchema = z
  .object({
    discountTranslationId: z.coerce.number().int().positive(),
  })
  .strict()
export const GetDiscountTranslationDetailResSchema = DiscountTranslationSchema
export const CreateDiscountTranslationBodySchema = DiscountTranslationSchema.pick({
  discountId: true,
  languageId: true,
  name: true,
  description: true,
}).strict()
export const UpdateDiscountTranslationBodySchema = CreateDiscountTranslationBodySchema

export type DiscountTranslationType = z.infer<typeof DiscountTranslationSchema>
export type GetDiscountTranslationDetailResType = z.infer<typeof GetDiscountTranslationDetailResSchema>
export type CreateDiscountTranslationBodyType = z.infer<typeof CreateDiscountTranslationBodySchema>
export type UpdateDiscountTranslationBodyType = z.infer<typeof UpdateDiscountTranslationBodySchema>
