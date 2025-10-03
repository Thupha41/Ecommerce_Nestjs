import { BadRequestException, ConflictException, Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { CreateReviewBodyType, GetReviewsType, ReviewType } from './review.model'
import { PaginationQueryType } from 'src/shared/models/request.model'
import { OrderStatus } from '@prisma/client'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

@Injectable()
export class ReviewRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async list(pagination: PaginationQueryType, productId: number): Promise<GetReviewsType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.review.count({
        where: {
          productId,
        },
      }),
      this.prismaService.review.findMany({
        where: {
          productId,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
          medias: true,
        },
        skip,
        take,
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ])
    return {
      items: data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    }
  }

  private async validateOrder({ orderId, userId }: { orderId: number; userId: number }) {
    const order = await this.prismaService.order.findUnique({
      where: {
        id: orderId,
        userId,
      },
    })
    //Mua hàng thì mới được review
    if (!order) {
      throw new BadRequestException('Đơn hàng không tồn tại hoặc không thuộc về bạn')
    }

    const { status } = order
    if (status !== OrderStatus.DELIVERED) {
      throw new BadRequestException('Bạn không thể đánh giá một đơn hàng chưa được giao thành công')
    }
    return order
  }

  private async validateUpdateReview({ reviewId, userId }: { reviewId: number; userId: number }) {
    const review = await this.prismaService.review.findUnique({
      where: {
        id: reviewId,
        userId,
      },
    })
    if (!review) {
      throw new BadRequestException('Đánh giá không tồn tại hoặc không thuộc về bạn')
    }

    if (review.updateCount >= 3) {
      throw new BadRequestException('Đánh giá đã được cập nhật tối đa 3 lần')
    }
    return review
  }

  private async validateProductInOrder({ productId, orderId }: { productId: number; orderId: number }) {
    const product = await this.prismaService.product.findUnique({
      where: { id: productId },
    })
    if (!product) {
      throw new BadRequestException('Sản phẩm không tồn tại')
    }

    const orderItems = await this.prismaService.productSKUSnapshot.findMany({
      where: { orderId },
    })

    const productInOrder = orderItems.some((item) => item.productId === productId)
    if (!productInOrder) {
      throw new BadRequestException('Sản phẩm không tồn tại trong đơn hàng')
    }
  }

  async create(userId: number, body: CreateReviewBodyType): Promise<ReviewType> {
    const { content, medias, productId, orderId, rating } = body
    await Promise.all([this.validateOrder({ orderId, userId }), this.validateProductInOrder({ productId, orderId })])
    return this.prismaService.$transaction(async (tx) => {
      const review = await tx.review
        .create({
          data: {
            content,
            rating,
            orderId,
            productId,
            userId,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                avatar: true,
              },
            },
          },
        })
        .catch((error) => {
          if (isUniqueConstraintPrismaError(error)) {
            throw new ConflictException('Bạn đã đánh giá sản phẩm này rồi')
          }
          throw error
        })
      const reviewMedias = await tx.reviewMedia.createManyAndReturn({
        data: medias.map((media) => ({
          url: media.url,
          type: media.type,
          reviewId: review.id,
        })),
      })
      return {
        ...review,
        medias: reviewMedias,
      }
    })
  }

  async update({
    reviewId,
    userId,
    body,
  }: {
    reviewId: number
    userId: number
    body: CreateReviewBodyType
  }): Promise<ReviewType> {
    const { content, medias, productId, orderId, rating } = body

    await Promise.all([
      this.validateOrder({ orderId, userId }),
      this.validateProductInOrder({ productId, orderId }),
      this.validateUpdateReview({ reviewId, userId }),
    ])
    return this.prismaService.$transaction(async (tx) => {
      const review = await tx.review.update({
        where: { id: reviewId, userId },
        data: {
          content,
          rating,
          productId,
          orderId,
          userId,
          updateCount: { increment: 1 },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              avatar: true,
            },
          },
        },
      })
      await tx.reviewMedia.deleteMany({
        where: { reviewId },
      })
      const reviewMedias = await tx.reviewMedia.createManyAndReturn({
        data: medias.map((media) => ({
          url: media.url,
          type: media.type,
          reviewId: review.id,
        })),
      })
      return {
        ...review,
        medias: reviewMedias,
      }
    })
  }

  async delete(userId: number, reviewId: number): Promise<ReviewType> {
    return await this.prismaService.review
      .delete({
        where: { id: reviewId, userId },
      })
      .catch((error) => {
        if (isNotFoundPrismaError(error)) {
          throw new BadRequestException('Đánh giá không tồn tại')
        }
        throw error
      })
  }
}
