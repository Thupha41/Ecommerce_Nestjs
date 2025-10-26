import { PaginationQuerySchema } from 'src/shared/models/request.model'
import { OrderSchema, OrderStatusSchema } from 'src/shared/models/shared-order.model'
import { z } from 'zod'
import { PaymentMethod } from 'src/shared/constants/payment.constant'

export const ProductSKUSnapshotSchema = z.object({
  id: z.number(),
  productId: z.number().nullable(),
  productName: z.string(),
  productTranslations: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
      description: z.string(),
      languageId: z.string(),
    }),
  ),
  skuPrice: z.number(),
  image: z.string(),
  skuValue: z.string(),
  skuId: z.number().nullable(),
  orderId: z.number().nullable(),
  quantity: z.number(),

  createdAt: z.date(),
})

export const BrandGroupSchema = z.object({
  brandId: z.number(),
  brandName: z.string(),
  brandLogo: z.string(),
  items: z.array(ProductSKUSnapshotSchema),
})

export const PaymentMethodSchema = z.enum([
  PaymentMethod.CASH,
  PaymentMethod.BANK,
])

export const GetOrderListResSchema = z.object({
  data: z.array(
    OrderSchema.extend({
      brandGroups: z.array(BrandGroupSchema),
    }).omit({
      receiver: true,
      deletedAt: true,
      deletedById: true,
      createdById: true,
      updatedById: true,
    }),
  ),
  totalItems: z.number(),
  page: z.number(), // Số trang hiện tại
  limit: z.number(), // Số item trên 1 trang
  totalPages: z.number(), // Tổng số trang
})

export const GetOrderListQuerySchema = PaginationQuerySchema.extend({
  status: OrderStatusSchema.optional(),
})

export const GetOrderDetailResSchema = OrderSchema.extend({
  brandGroups: z.array(BrandGroupSchema),
})

export const CreateOrderBodySchema =
    z.object({
      paymentMethod: PaymentMethodSchema,
      receiver: z.object({
        name: z.string(),
        phone: z.string().min(9).max(20),
        address: z.string(),
      }),
      cartItemIds: z.array(z.number()),
    })
    .strict()

export const CreateOrderResSchema = z.object({ orders: z.array(OrderSchema), paymentId: z.number() })
export const CancelOrderBodySchema = z.object({})
export const CancelOrderResSchema = OrderSchema

export const GetOrderParamsSchema = z
  .object({
    orderId: z.coerce.number().int().positive(),
  })
  .strict()

export type GetOrderListResType = z.infer<typeof GetOrderListResSchema>
export type GetOrderListQueryType = z.infer<typeof GetOrderListQuerySchema>
export type GetOrderDetailResType = z.infer<typeof GetOrderDetailResSchema>
export type GetOrderParamsType = z.infer<typeof GetOrderParamsSchema>
export type CreateOrderBodyType = z.infer<typeof CreateOrderBodySchema>
export type CreateOrderResType = z.infer<typeof CreateOrderResSchema>
export type CancelOrderResType = z.infer<typeof CancelOrderResSchema>
export type BrandGroupType = z.infer<typeof BrandGroupSchema>
