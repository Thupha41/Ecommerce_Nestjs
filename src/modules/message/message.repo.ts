import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { GetMessagesQueryType, GetMessagesResType, CreateMessageBodyType, CreateMessageResType } from './models/message.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class MessageRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: CreateMessageBodyType): Promise<CreateMessageResType> {
    const createData: any = {
      fromUserId: data.userId,
      content: data.content,
    }

    if (data.metadata !== undefined) {
      createData.metadata = data.metadata
    }

    const message = await this.prismaService.message.create({
      data: createData,
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
    }) as any

    // Ensure metadata is included in response
    return {
      ...message,
      metadata: message.metadata ?? null,
    } as CreateMessageResType
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
      items: data.map((item: any) => ({
        ...item,
        metadata: item.metadata ?? null,
      })) as GetMessagesResType['items'],
      totalItems,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalItems / limit),
    }
  }
}

