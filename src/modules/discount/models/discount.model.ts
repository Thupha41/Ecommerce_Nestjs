import { DiscountIncludeTranslationSchema, DiscountSchema } from 'src/shared/models/shared-discount.model'
import { z } from 'zod'
import { DiscountApplyTo, DiscountType } from 'src/shared/constants/discount.constants'
import { OrderBy, SortBy } from 'src/shared/constants/other.constant'

export const GetDiscountParamsSchema = z
  .object({
    discountId: z.coerce.number().int().positive(),
  })
  .strict()

export const GetDiscountsQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    type: z.enum([DiscountType.PERCENTAGE, DiscountType.FIXED]).optional(),
    code: z.string().optional(),
    maxUses: z.coerce.number().int().optional(),
    minOrderValue: z.coerce.number().optional(),
    minQuantity: z.coerce.number().int().optional(),
    maxUsesPerUser: z.coerce.number().int().optional(),
    startDateFrom: z.coerce.date().optional(),
    startDateTo: z.coerce.date().optional(),
    endDateFrom: z.coerce.date().optional(),
    endDateTo: z.coerce.date().optional(),
    isActive: z.coerce.boolean().optional(),
    applyTo: z.enum([DiscountApplyTo.ALL, DiscountApplyTo.SPECIFIC]).optional(),
    orderBy: z.enum([OrderBy.Asc, OrderBy.Desc]).default(OrderBy.Desc),
    sortBy: z
      .enum([
        SortBy.CreatedAt,
        SortBy.MinQuantity,
        SortBy.MinOrderValue,
        SortBy.MaxUses,
        SortBy.MaxUsesPerUser,
        SortBy.StartDate,
        SortBy.EndDate,
        SortBy.Value,
      ])
      .default(SortBy.CreatedAt),
    languageId: z.string().optional(),
  })
  .strict()

export const GetAllDiscountsResSchema = z.object({
  items: z.array(DiscountSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})

export const CreateDiscountBodySchema = DiscountSchema.pick({
  name: true,
  description: true,
  value: true,
  type: true,
  code: true,
  maxUses: true,
  minQuantity: true,
  maxUsesPerUser: true,
  startDate: true,
  endDate: true,
  minOrderValue: true,
  applyTo: true,
  isActive: true,
})
  .extend({
    skuIds: z.array(z.number()).optional(),
    skus: z.array(z.number()).optional(),
  })
  .strict()
  .transform((data) => {
    // Chuyển đổi skus thành skuIds nếu skuIds không được cung cấp
    if (data.skus && !data.skuIds) {
      data.skuIds = data.skus
    }
    // Xóa trường skus để không gây lỗi khi sử dụng data
    const { skus, ...rest } = data
    return rest
  })

export const UpdateDiscountBodySchema = DiscountSchema.pick({
  name: true,
  description: true,
  value: true,
  type: true,
  code: true,
  maxUses: true,
  minQuantity: true,
  maxUsesPerUser: true,
  startDate: true,
  endDate: true,
  minOrderValue: true,
  applyTo: true,
  isActive: true,
})
  .extend({
    skuIds: z.array(z.number()).optional(),
    skus: z.array(z.number()).optional(),
  })
  .partial() // Làm cho tất cả các trường trở thành optional
  .strict()
  .transform((data) => {
    // Chuyển đổi skus thành skuIds nếu skuIds không được cung cấp
    if (data.skus && !data.skuIds) {
      data.skuIds = data.skus
    }
    // Xóa trường skus để không gây lỗi khi sử dụng data
    const { skus, ...rest } = data
    return rest
  })
export const GetDiscountDetailResSchema = DiscountIncludeTranslationSchema

export type DiscountType = z.infer<typeof DiscountSchema>
export type GetDiscountsQueryType = z.infer<typeof GetDiscountsQuerySchema>
export type GetAllDiscountsResType = z.infer<typeof GetAllDiscountsResSchema>
export type GetDiscountParamsType = z.infer<typeof GetDiscountParamsSchema>
export type CreateDiscountBodyType = z.infer<typeof CreateDiscountBodySchema>
export type UpdateDiscountBodyType = z.infer<typeof UpdateDiscountBodySchema>
export type GetDiscountDetailResType = z.infer<typeof GetDiscountDetailResSchema>
