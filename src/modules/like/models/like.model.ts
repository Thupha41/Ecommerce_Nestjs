import { OrderBy } from 'src/shared/constants/other.constant'
import { LikeSchema } from 'src/shared/models/shared-like.model'
import { ProductSchema } from 'src/shared/models/shared-product.model'
import { z } from 'zod'

export const CreateLikeBodySchema = z
  .object({
    productId: z.coerce.number().int().positive(),
    quantity: z.coerce.number().int().refine((val) => val === 1 || val === -1, {
      message: 'Quantity must be either 1 (like) or -1 (dislike)',
    }),
  })
  .strict()

export const GetLikesQuerySchema = z.object({
  productId: z.coerce.number().int().positive().optional(),
  orderBy: z.enum([OrderBy.Asc, OrderBy.Desc]).default(OrderBy.Desc),
  sortBy: z.enum(['createdAt']).default('createdAt'),
})

export const GetLikesResSchema = z.object({
  items: z.array(
    LikeSchema.extend({
      product: ProductSchema.pick({
        id: true,
        name: true,
        productNo: true,
        basePrice: true,
        images: true,
      }),
    }),
  ),
  totalItems: z.number(),
})

export const LikeResSchema = LikeSchema.extend({
  product: ProductSchema.pick({
    id: true,
    name: true,
    productNo: true,
    basePrice: true,
    images: true,
  }),
}).nullable()

export type CreateLikeBodyType = z.infer<typeof CreateLikeBodySchema>
export type GetLikesQueryType = z.infer<typeof GetLikesQuerySchema>
export type GetLikesResType = z.infer<typeof GetLikesResSchema>
export type LikeResType = z.infer<typeof LikeResSchema>

