import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { Prisma } from '@prisma/client'
import {
  CartItemNotFoundException,
  InvalidQuantityException,
  NotFoundSKUException,
  OutOfStockSKUException,
  ProductNotFoundException,
} from './models/cart.error.model'
import {
  AddToCartBodyType,
  CartItemResponseType,
  CartItemDetailType,
  GetCartResType,
  UpdateCartItemBodyType,
  DeleteCartBodyType,
} from './models/cart.model'
import { ALL_LANGUAGE_CODE } from 'src/shared/constants/other.constant'
import { isNotFoundPrismaError } from 'src/shared/helpers'
import { SKUSchemaType } from 'src/shared/models/shared-sku.model'

@Injectable()
export class CartRepository {
  constructor(private readonly prismaService: PrismaService) {}
  private async validateSKU({
    skuId,
    quantity,
    userId,
    isCreate,
  }: {
    skuId: number
    quantity: number
    userId: number
    isCreate: boolean
  }): Promise<SKUSchemaType> {
    const [cartItem, sku] = await Promise.all([
      this.prismaService.cartItem.findUnique({
        where: {
          userId_skuId: {
            userId,
            skuId,
          },
        },
      }),
      this.prismaService.sKU.findUnique({
        where: { id: skuId, deletedAt: null },
        include: {
          product: true,
        },
      }),
    ])
    // Kiểm tra tồn tại của SKU
    if (!sku) {
      throw NotFoundSKUException
    }
    if (cartItem && isCreate && quantity + cartItem.quantity > sku.stock) {
      throw InvalidQuantityException
    }
    // Kiểm tra lượng hàng còn lại
    if (sku.stock < 1 || sku.stock < quantity) {
      throw OutOfStockSKUException
    }
    const { product } = sku

    // Kiểm tra sản phẩm đã bị xóa hoặc có công khai hay không
    if (
      product.deletedAt !== null ||
      product.publishedAt === null ||
      (product.publishedAt !== null && product.publishedAt > new Date())
    ) {
      throw ProductNotFoundException
    }
    return sku
  }

  async findAll({
    userId,
    languageId,
    limit,
    page,
  }: {
    userId: number
    languageId: string
    limit: number
    page: number
  }): Promise<GetCartResType> {
    const skip = (page - 1) * limit
    const take = limit
    const [cartItems, totalItems] = await Promise.all([
      this.prismaService.cartItem.findMany({
        where: {
          userId,
          sku: {
            product: {
              deletedAt: null,
              publishedAt: {
                lte: new Date(),
                not: null,
              },
            },
          },
        },
        include: {
          sku: {
            include: {
              product: {
                include: {
                  productTranslations: {
                    where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { languageId, deletedAt: null },
                  },
                  brand: true,
                },
              },
            },
          },
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.cartItem.count({
        where: {
          userId,
        },
      }),
    ])

    // Tính tổng số lượng sản phẩm trong giỏ hàng
    const cart_count_product = cartItems.reduce((total, item) => total + item.quantity, 0)

    // Tính tổng giá trị giỏ hàng
    const cart_total_price = cartItems.reduce((total, item) => {
      const price = item.sku?.price || 0
      return total + price * item.quantity
    }, 0)

    // Gom nhóm các cart items theo brandId sử dụng Map
    const groupMap = new Map<number, CartItemDetailType>()

    for (const cartItem of cartItems) {
      const brandId = cartItem.sku.product.brandId

      if (!groupMap.has(brandId)) {
        groupMap.set(brandId, {
          brand: {
            id: cartItem.sku.product.brand.id,
            name: cartItem.sku.product.brand.name,
            logo: cartItem.sku.product.brand.logo || '',
          },
          cartItems: [],
        })
      }

      groupMap.get(brandId)?.cartItems.push(cartItem)
    }

    // Chuyển đổi từ Map sang Array để phân trang
    const sortedGroups = Array.from(groupMap.values())

    // Phân trang trên các nhóm brand thay vì trên cart items
    const totalGroups = sortedGroups.length
    const pagedGroups = sortedGroups.slice(skip, skip + take)

    return {
      items: pagedGroups,
      totalItems, // Vẫn giữ tổng số cart items
      cart_count_product,
      cart_total_price,
      page,
      limit,
      totalPages: Math.ceil(totalGroups / limit), // Tính tổng số trang dựa trên số nhóm brand
    }
  }

  async findAll2({
    userId,
    languageId,
    page,
    limit,
  }: {
    userId: number
    languageId: string
    limit: number
    page: number
  }): Promise<GetCartResType> {
    const skip = (page - 1) * limit
    const take = limit
    // Đếm tổng số nhóm sản phẩm
    const totalItems$ = this.prismaService.$queryRaw<{ createdById: number }[]>`
      SELECT
        "Product"."createdById"
      FROM "CartItem"
      JOIN "SKU" ON "CartItem"."skuId" = "SKU"."id"
      JOIN "Product" ON "SKU"."productId" = "Product"."id"
      WHERE "CartItem"."userId" = ${userId}
        AND "Product"."deletedAt" IS NULL
        AND "Product"."publishedAt" IS NOT NULL
        AND "Product"."publishedAt" <= NOW()
      GROUP BY "Product"."createdById"
    `
    const data$ = await this.prismaService.$queryRaw<CartItemDetailType[]>`
     SELECT
       "Product"."createdById",
       json_agg(
         jsonb_build_object(
           'id', "CartItem"."id",
           'quantity', "CartItem"."quantity",
           'skuId', "CartItem"."skuId",
           'userId', "CartItem"."userId",
           'createdAt', "CartItem"."createdAt",
           'updatedAt', "CartItem"."updatedAt",
           'sku', jsonb_build_object(
             'id', "SKU"."id",
              'value', "SKU"."value",
              'price', "SKU"."price",
              'stock', "SKU"."stock",
              'image', "SKU"."image",
              'productId', "SKU"."productId",
              'product', jsonb_build_object(
                'id', "Product"."id",
                'publishedAt', "Product"."publishedAt",
                'name', "Product"."name",
                'basePrice', "Product"."basePrice",
                'virtualPrice', "Product"."virtualPrice",
                'brandId', "Product"."brandId",
                'images', "Product"."images",
                'variants', "Product"."variants",
                'productTranslations', COALESCE((
                  SELECT json_agg(
                    jsonb_build_object(
                      'id', pt."id",
                      'productId', pt."productId",
                      'languageId', pt."languageId",
                      'name', pt."name",
                      'description', pt."description"
                    )
                  ) FILTER (WHERE pt."id" IS NOT NULL)
                  FROM "ProductTranslation" pt
                  WHERE pt."productId" = "Product"."id"
                    AND pt."deletedAt" IS NULL
                    ${languageId === ALL_LANGUAGE_CODE ? Prisma.sql`` : Prisma.sql`AND pt."languageId" = ${languageId}`}
                ), '[]'::json)
              )
           )
         ) ORDER BY "CartItem"."updatedAt" DESC
       ) AS "cartItems",
       jsonb_build_object(
         'id', "User"."id",
         'name', "User"."name",
         'avatar', "User"."avatar"
       ) AS "shop"
     FROM "CartItem"
     JOIN "SKU" ON "CartItem"."skuId" = "SKU"."id"
     JOIN "Product" ON "SKU"."productId" = "Product"."id"
     LEFT JOIN "ProductTranslation" ON "Product"."id" = "ProductTranslation"."productId"
       AND "ProductTranslation"."deletedAt" IS NULL
       ${languageId === ALL_LANGUAGE_CODE ? Prisma.sql`` : Prisma.sql`AND "ProductTranslation"."languageId" = ${languageId}`}
     LEFT JOIN "User" ON "Product"."createdById" = "User"."id"
     WHERE "CartItem"."userId" = ${userId}
        AND "Product"."deletedAt" IS NULL
        AND "Product"."publishedAt" IS NOT NULL
        AND "Product"."publishedAt" <= NOW()
     GROUP BY "Product"."createdById", "User"."id"
     ORDER BY MAX("CartItem"."updatedAt") DESC
      LIMIT ${take} 
      OFFSET ${skip}
   `
    const [data, totalItems] = await Promise.all([data$, totalItems$])

    return {
      items: data,
      cart_count_product: data.reduce((total, item) => total + item.cartItems.length, 0),
      cart_total_price: data.reduce(
        (total, item) => total + item.cartItems.reduce((total, item) => total + item.sku.price * item.quantity, 0),
        0,
      ),
      page,
      limit,
      totalItems: totalItems.length,
      totalPages: Math.ceil(totalItems.length / limit),
    }
  }

  async create(userId: number, body: AddToCartBodyType): Promise<CartItemResponseType> {
    await this.validateSKU({
      skuId: body.skuId,
      quantity: body.quantity,
      userId,
      isCreate: true,
    })

    return this.prismaService.cartItem.upsert({
      where: {
        userId_skuId: {
          userId,
          skuId: body.skuId,
        },
      },
      update: {
        quantity: {
          increment: body.quantity,
        },
      },
      create: {
        userId,
        skuId: body.skuId,
        quantity: body.quantity,
      },
    })
  }

  async update({
    userId,
    body,
    cartItemId,
  }: {
    userId: number
    cartItemId: number
    body: UpdateCartItemBodyType
  }): Promise<CartItemResponseType> {
    await this.validateSKU({
      skuId: body.skuId,
      quantity: body.quantity,
      userId,
      isCreate: false,
    })

    return this.prismaService.cartItem
      .update({
        where: {
          id: cartItemId,
          userId,
        },
        data: {
          skuId: body.skuId,
          quantity: body.quantity,
        },
      })
      .catch((error) => {
        if (isNotFoundPrismaError(error)) {
          throw CartItemNotFoundException
        }
        throw error
      })
  }

  async delete(userId: number, body: DeleteCartBodyType): Promise<{ count: number; notFoundIds: number[] }> {
    const { cartItemIds } = body

    // Kiểm tra xem các cart item có tồn tại không
    const existingItems = await this.prismaService.cartItem.findMany({
      where: {
        userId,
        id: { in: cartItemIds },
      },
      select: { id: true },
    })

    // Lấy danh sách ID đã tìm thấy
    const foundIds = existingItems.map((item) => item.id)

    // Tìm các ID không tồn tại
    const notFoundIds = cartItemIds.filter((id) => !foundIds.includes(id))

    // Xóa các cart item đã tìm thấy
    const result = await this.prismaService.cartItem.deleteMany({
      where: { userId, id: { in: foundIds } },
    })

    return {
      count: result.count,
      notFoundIds,
    }
  }
}
