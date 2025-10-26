import { Injectable } from '@nestjs/common'
import { OrderStatus, PaymentStatus, Prisma } from '@prisma/client'
import {
  CannotCancelOrderException,
  NotFoundCartItemException,
  OutOfStockSKUException,
  OrderNotFoundException,
  ProductNotFoundException,
} from 'src/modules/order/models/order.error.model'
import {
  CancelOrderResType,
  GetOrderDetailResType,
  GetOrderListQueryType,
  GetOrderListResType,
  CreateOrderBodyType,
  CreateOrderResType,
  BrandGroupType,
} from 'src/modules/order/models/order.model'
import { isNotFoundPrismaError } from 'src/shared/helpers'
import { PrismaService } from 'src/shared/services/prisma.service'
import { OrderProducer } from './order.producer'

@Injectable()
export class OrderRepo {
  constructor(
    private readonly prismaService: PrismaService,
    private readonly orderProducer: OrderProducer,
  ) {}
  async list(userId: number, query: GetOrderListQueryType): Promise<GetOrderListResType> {
    const { page, limit, status } = query
    const skip = (page - 1) * limit
    const take = limit
    const where: Prisma.OrderWhereInput = {
      userId,
      status,
    }

    // Đếm tổng số order
    const totalItem$ = this.prismaService.order.count({
      where,
    })
    // Lấy list order
    const data$ = await this.prismaService.order.findMany({
      where,
      include: {
        items: {
          include: {
            product: {
              include: {
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
    })
    const [data, totalItems] = await Promise.all([data$, totalItem$])
    
    // Group items by brand for each order
    const ordersWithBrandGroups = data.map((order) => {
      const brandGroupsMap = new Map<number, BrandGroupType>()
      
      for (const item of order.items) {
        const brandId = item.product?.brandId
        if (!brandId || !item.product?.brand) continue
        
        if (!brandGroupsMap.has(brandId)) {
          brandGroupsMap.set(brandId, {
            brandId,
            brandName: item.product.brand.name,
            brandLogo: item.product.brand.logo || '',
            items: [],
          })
        }
        
        brandGroupsMap.get(brandId)!.items.push(item)
      }
      
      const { items, ...orderWithoutItems } = order
      
      return {
        ...orderWithoutItems,
        brandGroups: Array.from(brandGroupsMap.values()),
      }
    })
    
    return {
      data: ordersWithBrandGroups,
      page,
      limit,
      totalItems,
      totalPages: Math.ceil(totalItems / limit),
    }
  }

  async detail(userId: number, orderid: number): Promise<GetOrderDetailResType> {
    const order = await this.prismaService.order.findUnique({
      where: {
        id: orderid,
        userId,
        deletedAt: null,
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                brand: true,
              },
            },
          },
        },
      },
    })
    if (!order) {
      throw OrderNotFoundException
    }
    
    // Group items by brand
    const brandGroupsMap = new Map<number, BrandGroupType>()
    
    for (const item of order.items) {
      const brandId = item.product?.brandId
      if (!brandId || !item.product?.brand) continue
      
      if (!brandGroupsMap.has(brandId)) {
        brandGroupsMap.set(brandId, {
          brandId,
          brandName: item.product.brand.name,
          brandLogo: item.product.brand.logo || '',
          items: [],
        })
      }
      
      brandGroupsMap.get(brandId)!.items.push(item)
    }
    
    const { items, ...orderWithoutItems } = order
    
    return {
      ...orderWithoutItems,
      brandGroups: Array.from(brandGroupsMap.values()),
    }
  }

  async cancel(userId: number, orderId: number): Promise<CancelOrderResType> {
    try {
      const order = await this.prismaService.order.findUniqueOrThrow({
        where: {
          id: orderId,
          userId,
          deletedAt: null,
        },
      })
      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        throw CannotCancelOrderException
      }
      const updatedOrder = await this.prismaService.order.update({
        where: {
          id: orderId,
          userId,
          deletedAt: null,
        },
        data: {
          status: OrderStatus.CANCELLED,
          updatedById: userId,
        },
      })
      return updatedOrder
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw OrderNotFoundException
      }
      throw error
    }
  }

  async create(
    userId: number,
    body: CreateOrderBodyType,
  ): Promise<{
    paymentId: number
    orders: CreateOrderResType['orders']
  }> {
    // 1. Kiểm tra xem tất cả cartItemIds có tồn tại trong cơ sở dữ liệu hay không
    // 2. Kiểm tra số lượng mua có lớn hơn số lượng tồn kho hay không
    // 3. Kiểm tra xem tất cả sản phẩm mua có sản phẩm nào bị xóa hay ẩn không
    // 4. Tạo order
    // 5. Xóa cartItem

    const cartItems = await this.prismaService.cartItem.findMany({
      where: {
        id: { in: body.cartItemIds },
        userId,
      },
      include: {
        sku: {
          include: {
            product: {
              include: {
                productTranslations: true,
              },
            },
          },
        },
      },
    })

    // 1. Kiểm tra xem tất cả cartItemIds có tồn tại trong cơ sở dữ liệu hay không
    if (cartItems.length !== body.cartItemIds.length) {
      throw NotFoundCartItemException
    }

    // 2. Kiểm tra số lượng mua có lớn hơn số lượng tồn kho hay không
    const isOutOfStock = cartItems.some((item) => {
      return item.sku.stock < item.quantity
    })

    if (isOutOfStock) {
      throw OutOfStockSKUException
    }

    // 3. Kiểm tra xem tất cả sản phẩm mua có sản phẩm nào bị xóa hay ẩn không
    const isExistNotReadyProduct = cartItems.some(
      (item) =>
        item.sku.product.deletedAt !== null ||
        item.sku.product.publishedAt === null ||
        item.sku.product.publishedAt > new Date(),
    )
    if (isExistNotReadyProduct) {
      throw ProductNotFoundException
    }

    // 4. Tạo order và xóa cartItem trong transaction để đảm bảo tính toàn vẹn dữ liệu
    const [paymentId, order] = await this.prismaService.$transaction(async (tx) => {
      const payment = await tx.payment.create({
        data: {
          status: PaymentStatus.PENDING,
          paymentMethod: body.paymentMethod,
        },
      })

      const cartItemMap = new Map<number, (typeof cartItems)[0]>()
      cartItems.forEach((item) => {
        cartItemMap.set(item.id, item)
      })

      const order = await tx.order.create({
        data: {
          userId,
          status: OrderStatus.PENDING_PAYMENT,
          receiver: body.receiver,
          createdById: userId,
          paymentId: payment.id,
          items: {
            create: body.cartItemIds.map((cartItemId) => {
              const cartItem = cartItemMap.get(cartItemId)!
              return {
                productName: cartItem.sku.product.name,
                skuPrice: cartItem.sku.price,
                image: cartItem.sku.image,
                skuId: cartItem.sku.id,
                skuValue: cartItem.sku.value,
                quantity: cartItem.quantity,
                productId: cartItem.sku.product.id,
                productTranslations: cartItem.sku.product.productTranslations.map((translation) => {
                  return {
                    id: translation.id,
                    name: translation.name,
                    description: translation.description,
                    languageId: translation.languageId,
                  }
                }),
              }
            }),
          },
          products: {
            connect: body.cartItemIds.map((cartItemId) => {
              const cartItem = cartItemMap.get(cartItemId)!
              return {
                id: cartItem.sku.product.id,
              }
            }),
          },
        },
      })

      const cartItem$ = tx.cartItem.deleteMany({
        where: {
          id: { in: body.cartItemIds },
        },
      })

      const sku$ = Promise.all(
        cartItems.map((item) => {
          return tx.sKU.update({
            where: { id: item.sku.id },
            data: {
              stock: {
                decrement: item.quantity,
              },
            },
          })
        }),
      )

      const cancelPaymentJob$ = await this.orderProducer.addCancelPaymentJob(payment.id)

      await Promise.all([cartItem$, sku$, cancelPaymentJob$])
      return [payment.id, order]
    })

    return {
      orders: [order],
      paymentId,
    }
  }
}
