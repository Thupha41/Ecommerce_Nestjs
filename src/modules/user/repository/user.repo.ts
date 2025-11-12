import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import { CreateUserBodyType, GetUsersQueryType, GetUsersResType } from 'src/modules/user/models/user.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { UserType } from 'src/shared/models/shared-user.model'
import { IUserRepository } from './user.repo.interface'

@Injectable()
export class UserRepo implements IUserRepository {
  constructor(private prismaService: PrismaService) {}

  async list(pagination: GetUsersQueryType): Promise<GetUsersResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
    }

    if (pagination.status) {
      where.status = pagination.status
    }

    if (pagination.role) {
      where.role = {
        name: pagination.role,
      }
    }

    if (pagination.search) {
      where.OR = [
        { email: { contains: pagination.search, mode: 'insensitive' } },
        { name: { contains: pagination.search, mode: 'insensitive' } },
        { phoneNumber: { contains: pagination.search, mode: 'insensitive' } },
      ]
    }

    const [totalItems, data] = await Promise.all([
      this.prismaService.user.count({
        where,
      }),
      this.prismaService.user.findMany({
        where,
        skip,
        take,
        include: {
          role: true,
        },
      }),
    ])
    return {
      data,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    }
  }

  create({ createdById, data }: { createdById: number | null; data: CreateUserBodyType }): Promise<UserType> {
    return this.prismaService.user.create({
      data: {
        ...data,
        createdById,
      },
    })
  }

  delete(
    {
      id,
      deletedById,
    }: {
      id: number
      deletedById: number
    },
    isHard?: boolean,
  ): Promise<UserType> {
    return isHard
      ? this.prismaService.user.delete({
          where: {
            id,
          },
        })
      : this.prismaService.user.update({
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
}
