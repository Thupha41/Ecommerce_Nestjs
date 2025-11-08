import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { GetMessagesQueryType, GetMessagesResType, CreateMessageBodyType, CreateMessageResType } from './models/message.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class MessageRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async create(fromUserId: number, data: CreateMessageBodyType): Promise<CreateMessageResType> {
    const message = await this.prismaService.message.create({
      data: {
        fromUserId,
        content: data.content,
        metadata: data.metadata || null,
      },
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    })

    return message
  }

  async list(query: GetMessagesQueryType): Promise<GetMessagesResType> {
    const { page, limit, fromUserId, orderBy, sortBy } = query
    const skip = (page - 1) * limit
    const take = limit

    const where: Prisma.MessageWhereInput = {}
    if (fromUserId) {
      where.fromUserId = fromUserId
    }

    const orderByClause: Prisma.MessageOrderByWithRelationInput = {
      [sortBy]: orderBy,
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.message.count({
        where,
      }),
      this.prismaService.message.findMany({
        where,
        include: {
          fromUser: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
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

