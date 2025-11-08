import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { GetLikesQueryType, GetLikesResType, CreateLikeBodyType, LikeResType } from './models/like.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError } from 'src/shared/helpers'

@Injectable()
export class LikeRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async likeOrDislike(userId: number, data: CreateLikeBodyType): Promise<LikeResType | null> {
    const { productId, quantity } = data

    // Kiểm tra product có tồn tại không
    const product = await this.prismaService.product.findUnique({
      where: {
        id: productId,
        deletedAt: null,
      },
    })

    if (!product) {
      throw NotFoundRecordException
    }

    if (quantity === 1) {
      // Like: Tạo hoặc cập nhật like record (upsert)
      const like = await this.prismaService.like.upsert({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        create: {
          userId,
          productId,
        },
        update: {},
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              productNo: true,
              basePrice: true,
              images: true,
            },
          },
        },
      })

      return like
    } else if (quantity === -1) {
      // Dislike: Xóa like record
      try {
        await this.prismaService.like.delete({
          where: {
            userId_productId: {
              userId,
              productId,
            },
          },
        })
        return null
      } catch (error) {
        if (isNotFoundPrismaError(error)) {
          // Like record không tồn tại, trả về null
          return null
        }
        throw error
      }
    }

    return null
  }

  async list(query: GetLikesQueryType): Promise<GetLikesResType> {
    const { page, limit, userId, productId, orderBy, sortBy } = query
    const skip = (page - 1) * limit
    const take = limit

    const where: Prisma.LikeWhereInput = {}
    if (userId) {
      where.userId = userId
    }
    if (productId) {
      where.productId = productId
    }

    const orderByClause: Prisma.LikeOrderByWithRelationInput = {
      [sortBy]: orderBy,
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.like.count({
        where,
      }),
      this.prismaService.like.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          product: {
            select: {
              id: true,
              name: true,
              productNo: true,
              basePrice: true,
              images: true,
            },
          },
        },
        orderBy: orderByClause,
        skip,
        take,
      }),
    ])

    return {
      items: data,
      totalItems,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalItems / limit),
    }
  }
}

