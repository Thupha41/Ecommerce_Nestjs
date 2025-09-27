import { BrandSchema } from 'src/shared/models/shared-brand.model'
import { ProductTranslationSchema } from 'src/shared/models/shared-product-translation.model'
import { ProductSchema } from 'src/shared/models/shared-product.model'
import { SKUSchema } from 'src/shared/models/shared-sku.model'
import { z } from 'zod'

export const CartItemSchema = z.object({
  id: z.number(),
  quantity: z.number(),
  skuId: z.number(),
  userId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

// Schema cho kết quả trả về khi tạo cart item
export const CartItemResponseSchema = CartItemSchema.extend({
  // Thêm các trường khác nếu cần
})

export const GetCartItemParamsSchema = z.object({
  cartItemId: z.coerce.number().int().positive(),
})

export const CartItemDetailSchema = z.object({
  brand: BrandSchema.pick({
    id: true,
    name: true,
    logo: true,
  }),
  cartItems: z.array(
    CartItemSchema.extend({
      sku: SKUSchema.extend({
        product: ProductSchema.extend({
          productTranslations: z.array(ProductTranslationSchema),
        }).omit({
          brandId: true,
        }),
      }),
    }),
  ),
})

export const GetCartResSchema = z.object({
  items: z.array(CartItemDetailSchema),
  totalItems: z.number(), // Số lượng bản ghi cart item
  cart_count_product: z.number(), // Tổng số lượng sản phẩm trong giỏ hàng
  cart_total_price: z.number(), // Tổng giá trị giỏ hàng
  page: z.number(), // Số trang hiện tại
  limit: z.number(), // Số item trên 1 trang
  totalPages: z.number(), // Tổng số trang
})

export const AddToCartBodySchema = z
  .object({
    skuId: z.number(),
    quantity: z.number(),
  })
  .strict()

export const UpdateCartItemBodySchema = AddToCartBodySchema

export const DeleteCartBodySchema = z
  .object({
    cartItemIds: z.array(z.number().int().positive()),
  })
  .strict()

export type CartItemType = z.infer<typeof CartItemSchema>
export type CartItemResponseType = z.infer<typeof CartItemResponseSchema>
export type GetCartItemParamType = z.infer<typeof GetCartItemParamsSchema>
export type CartItemDetailType = z.infer<typeof CartItemDetailSchema>
export type GetCartResType = z.infer<typeof GetCartResSchema>
export type AddToCartBodyType = z.infer<typeof AddToCartBodySchema>
export type UpdateCartItemBodyType = z.infer<typeof UpdateCartItemBodySchema>
export type DeleteCartBodyType = z.infer<typeof DeleteCartBodySchema>
