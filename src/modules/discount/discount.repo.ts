import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateDiscountBodyType, GetDiscountDetailResType, UpdateDiscountBodyType } from './models/discount.model'
import {
  DiscountCodeAlreadyExistsException,
  DiscountCodeNotFoundException,
  DiscountStartDateMustBeBeforeEndDateException,
} from './models/discount.error.model'
import { DiscountApplyTo } from 'src/shared/constants/discount.constants'
import { isNotFoundPrismaError } from 'src/shared/helpers'
import { GetDiscountsQueryType, GetAllDiscountsResType } from './models/discount.model'
import { Prisma } from '@prisma/client'
import { ALL_LANGUAGE_CODE } from 'src/shared/constants/other.constant'

@Injectable()
export class DiscountRepo {
  constructor(private prismaService: PrismaService) {}
  private checkDiscountExist = async (code: string) => {
    const discount = await this.prismaService.discount.findUnique({
      where: {
        code,
        isActive: true,
      },
    })
    return discount
  }
  async create(payload: CreateDiscountBodyType, createdById: number): Promise<GetDiscountDetailResType> {
    const {
      name,
      description,
      type,
      value,
      code,
      maxUses,
      maxUsesPerUser,
      minOrderValue,
      startDate,
      endDate,
      minQuantity,
      isActive,
      applyTo,
    } = payload

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      throw DiscountStartDateMustBeBeforeEndDateException
    }

    const discount = await this.checkDiscountExist(code)
    if (discount) {
      throw DiscountCodeAlreadyExistsException
    }

    if (discount) {
      throw DiscountCodeAlreadyExistsException
    }
    const result = await this.prismaService.discount.create({
      data: {
        name,
        description,
        value,
        type,
        code,
        maxUses,
        minQuantity,
        maxUsesPerUser,
        minOrderValue,
        startDate: startDate ? new Date(startDate) : new Date(),
        endDate: endDate ? new Date(endDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        isActive: isActive ?? true,
        applyTo: applyTo || DiscountApplyTo.ALL,
        createdById,
        skus:
          applyTo === DiscountApplyTo.SPECIFIC
            ? {
                connect: payload.skuIds?.map((id) => ({ id })) || [],
              }
            : undefined,
      },
      include: {
        discountTranslations: {
          where: { deletedAt: null },
        },
      },
    })

    return {
      ...result,
      value: Number(result.value),
      minOrderValue: Number(result.minOrderValue),
      discountTranslations: result.discountTranslations || [],
    }
  }

  async update({
    id,
    updatedById,
    data,
  }: {
    id: number
    updatedById: number
    data: UpdateDiscountBodyType
  }): Promise<GetDiscountDetailResType> {
    try {
      // Trước tiên, lấy discount hiện tại để giữ lại các giá trị không được cập nhật
      const currentDiscount = await this.prismaService.discount.findUnique({
        where: { id, deletedAt: null },
      })

      if (!currentDiscount) {
        throw DiscountCodeNotFoundException
      }

      // Chuẩn bị dữ liệu cập nhật
      const updateData: any = {
        updatedById,
      }

      // Chỉ cập nhật các trường được cung cấp
      if (data.name !== undefined) updateData.name = data.name
      if (data.description !== undefined) updateData.description = data.description
      if (data.value !== undefined) updateData.value = data.value
      if (data.type !== undefined) updateData.type = data.type
      if (data.code !== undefined) updateData.code = data.code
      if (data.maxUses !== undefined) updateData.maxUses = data.maxUses
      if (data.minQuantity !== undefined) updateData.minQuantity = data.minQuantity
      if (data.maxUsesPerUser !== undefined) updateData.maxUsesPerUser = data.maxUsesPerUser
      if (data.minOrderValue !== undefined) updateData.minOrderValue = data.minOrderValue
      if (data.isActive !== undefined) updateData.isActive = data.isActive

      // Xử lý startDate và endDate
      if (data.startDate !== undefined) {
        updateData.startDate = data.startDate ? new Date(data.startDate) : null
      }

      if (data.endDate !== undefined) {
        updateData.endDate = data.endDate ? new Date(data.endDate) : null
      }

      // Kiểm tra ngày bắt đầu và kết thúc
      if (updateData.startDate && updateData.endDate && updateData.startDate > updateData.endDate) {
        throw DiscountStartDateMustBeBeforeEndDateException
      }

      // Xử lý applyTo và skuIds
      if (data.applyTo !== undefined) {
        updateData.applyTo = data.applyTo

        // Nếu applyTo được cập nhật thành SPECIFIC và có skuIds
        if (data.applyTo === DiscountApplyTo.SPECIFIC && data.skuIds) {
          updateData.skus = {
            set: [], // Xóa các liên kết hiện tại
            connect: data.skuIds.map((id) => ({ id })),
          }
        }
        // Nếu applyTo được cập nhật thành ALL, xóa tất cả liên kết SKU
        else if (data.applyTo === DiscountApplyTo.ALL) {
          updateData.skus = {
            set: [], // Xóa tất cả liên kết
          }
        }
      }
      // Nếu applyTo không thay đổi nhưng skuIds được cung cấp và applyTo hiện tại là SPECIFIC
      else if (data.skuIds && currentDiscount.applyTo === DiscountApplyTo.SPECIFIC) {
        updateData.skus = {
          set: [], // Xóa các liên kết hiện tại
          connect: data.skuIds.map((id) => ({ id })),
        }
      }

      // Thực hiện cập nhật
      const result = await this.prismaService.discount.update({
        where: { id, deletedAt: null },
        data: updateData,
        include: {
          discountTranslations: {
            where: { deletedAt: null },
          },
        },
      })

      return {
        ...result,
        value: Number(result.value),
        minOrderValue: Number(result.minOrderValue),
        discountTranslations: result.discountTranslations || [],
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw DiscountCodeNotFoundException
      }
      throw error
    }
  }
  async list({
    limit,
    page,
    type,
    code,
    maxUses,
    minOrderValue,
    minQuantity,
    maxUsesPerUser,
    startDateFrom,
    startDateTo,
    endDateFrom,
    endDateTo,
    isActive,
    applyTo,
    orderBy,
    sortBy,
    languageId,
  }: GetDiscountsQueryType): Promise<GetAllDiscountsResType> {
    const skip = (page - 1) * limit
    const take = limit
    const where: Prisma.DiscountWhereInput = {
      deletedAt: null,
    }

    // Áp dụng các bộ lọc nếu được cung cấp
    if (type !== undefined) {
      where.type = type
    }

    if (code !== undefined) {
      where.code = {
        contains: code,
        mode: 'insensitive',
      }
    }

    if (maxUses !== undefined) {
      where.maxUses = maxUses
    }

    if (minOrderValue !== undefined) {
      where.minOrderValue = minOrderValue
    }

    if (minQuantity !== undefined) {
      where.minQuantity = minQuantity
    }

    if (maxUsesPerUser !== undefined) {
      where.maxUsesPerUser = maxUsesPerUser
    }

    if (isActive !== undefined) {
      where.isActive = isActive
    }

    if (applyTo !== undefined) {
      where.applyTo = applyTo
    }

    // Lọc theo khoảng thời gian của startDate
    if (startDateFrom || startDateTo) {
      where.startDate = {}

      if (startDateFrom) {
        where.startDate.gte = startDateFrom
      }

      if (startDateTo) {
        where.startDate.lte = startDateTo
      }
    }

    // Lọc theo khoảng thời gian của endDate
    if (endDateFrom || endDateTo) {
      where.endDate = {}

      if (endDateFrom) {
        where.endDate.gte = endDateFrom
      }

      if (endDateTo) {
        where.endDate.lte = endDateTo
      }
    }

    // Xác định trường sắp xếp và thứ tự
    const orderByClause: Prisma.DiscountOrderByWithRelationInput = {
      [sortBy]: orderBy,
    }

    // Thực hiện truy vấn với bộ lọc và phân trang
    const [items, totalItems] = await Promise.all([
      this.prismaService.discount.findMany({
        where,
        include: {
          discountTranslations: {
            where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
          },
        },
        orderBy: orderByClause,
        skip,
        take,
      }),
      this.prismaService.discount.count({ where }),
    ])

    // Chuyển đổi các trường Decimal thành số
    const formattedItems = items.map((item) => ({
      ...item,
      value: Number(item.value),
      minOrderValue: Number(item.minOrderValue),
      discountTranslations: item.discountTranslations || [],
    }))

    return {
      items: formattedItems,
      totalItems,
      page,
      limit,
      totalPages: Math.ceil(totalItems / limit),
    }
  }
  // static async getAllDiscountCodesWithProducts({
  //   discount_code,
  //   discount_userId,
  //   limit,
  //   page
  // }: {
  //   discount_code: string
  //   discount_userId: string
  //   limit: number
  //   page: number
  // }) {
  //   const foundDiscount = await databaseService.discounts.findOne({
  //     discount_code,
  //     discount_is_active: true,
  //     discount_userId: new ObjectId(discount_userId)
  //   })

  //   if (!foundDiscount) {
  //     throw new ErrorWithStatus({
  //       message: DISCOUNTS_MESSAGES.DISCOUNT_NOT_FOUND,
  //       status: HTTP_STATUS.NOT_FOUND
  //     })
  //   }
  //   console.log('>>> check found discount code', foundDiscount)
  //   const { discount_apply_to, discount_products } = foundDiscount
  //   let products

  //   if (discount_apply_to === 'all') {
  //     products = await productRepository.findAll({
  //       limit: +limit || 50,
  //       page: +page || 1,
  //       sort: 'ctime',
  //       select: ['product_name'] as string[],
  //       filter: {
  //         user_id: new ObjectId(discount_userId),
  //         isPublished: true
  //       }
  //     })
  //   }

  //   if (discount_apply_to === 'specific') {
  //     products = await productRepository.findAll({
  //       limit: +limit || 50,
  //       page: +page || 1,
  //       sort: 'ctime',
  //       select: ['product_name'] as string[],
  //       filter: {
  //         _id: { $in: discount_products.map((product) => product.product_id) as ObjectId[] },
  //         isPublished: true
  //       }
  //     })
  //     console.log('>>> check products', products)
  //   }

  //   return products
  // }

  // Get all discount code of shop
  // static async getAllDiscountCodeOfShop({
  //   limit,
  //   page,
  // }: {
  //   limit: number
  //   page: number
  // }) {
  //   const discounts = await findAllDiscountCodeUnselect({
  //     limit: +limit || 50,
  //     page: +page || 1,
  //     filter: {
  //       discount_is_active: true
  //     },
  //     unSelect: ['__v'],
  //     model: databaseService.discounts,
  //     sort: 'ctime'
  //   })
  //   return discounts
  // }

  //Apply discount code
  /*
     products = {
      {
        productId,
        shopId,
        quantity,
        name,
        price
      },
            {
        productId,
        shopId,
        quantity,
        name,
        price
      },
     }
  */

  async delete({ id, deletedById }: { id: number; deletedById: number }, isHard: boolean = false) {
    try {
      if (isHard) {
        return await this.prismaService.discount.delete({
          where: {
            id,
          },
        })
      } else {
        return await this.prismaService.discount.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedById,
          },
        })
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw DiscountCodeNotFoundException
      }
      throw error
    }
  }
}

// async getDiscountAmount({ products, code }: GetDiscountAmountReqBody) {
//   const foundDiscount = await this.checkDiscountExist(code)
//   if (!foundDiscount) {
//     throw DiscountCodeNotFoundException
//   }

//   const { maxUses, maxUsesPerUser, usedCount, minOrderValue, value, type } = foundDiscount

//   if (usedCount >= maxUses) {
//     throw DiscountMaxUsesReachedException
//   }

//   if (maxUsesPerUser === 0) {
//     throw DiscountMaxUsesPerUserReachedException
//   }

//   // check xem co gia tri toi thieu hay khong
//   let totalOrder: number = 0
//   if (minOrderValue.toNumber() > totalOrder) {
//     totalOrder = products.reduce(
//       (total: number, product) => total + Number(product.price) * Number(product.quantity),
//       0,
//     )
//   }
//   if (totalOrder < minOrderValue.toNumber()) {
//     throw new BadRequestException(`Discount requires a minimum order value ${minOrderValue.toNumber()}`)
//   }

//   //check xem discount nay la fixed amount hay percentage
//   const discountAmount: number = type === DiscountType.PERCENTAGE ? Number(value) : (totalOrder * Number(value)) / 100
//   return {
//     discountAmount,
//     totalOrder,
//     totalPrice: totalOrder - discountAmount,
//   }
// }
