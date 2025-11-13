import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  CreatePermissionBodyType,
  GetPermissionsQueryType,
  GetPermissionsResType,
  PermissionType,
  UpdatePermissionBodyType,
} from 'src/modules/permission/models/permission.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { IPermissionRepository } from './permission.repo.interface'

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(private prismaService: PrismaService) {}

  async list(pagination: GetPermissionsQueryType): Promise<GetPermissionsResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit

    const where: Prisma.PermissionWhereInput = {
      deletedAt: null,
    }

    if (pagination.module) {
      where.module = pagination.module
    }

    if (pagination.method) {
      where.method = pagination.method
    }

    const [totalItems, permissions] = await Promise.all([
      this.prismaService.permission.count({
        where,
      }),
      this.prismaService.permission.findMany({
        where,
        skip,
        take,
      }),
    ])
    return {
      items: permissions,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    }
  }

  async getDistinctModules(): Promise<string[]> {
    const permissions = await this.prismaService.permission.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        module: true,
      },
      distinct: ['module'],
    })
    return permissions.map((p) => p.module).filter((module) => module && module.trim() !== '')
  }

  async getDistinctMethods(): Promise<string[]> {
    const permissions = await this.prismaService.permission.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        method: true,
      },
      distinct: ['method'],
    })
    return permissions.map((p) => p.method)
  }

  findById(id: number): Promise<PermissionType | null> {
    return this.prismaService.permission.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })
  }

  create({
    createdById,
    data,
  }: {
    createdById: number | null
    data: CreatePermissionBodyType
  }): Promise<PermissionType> {
    return this.prismaService.permission.create({
      data: {
        ...data,
        createdById,
      },
    })
  }

  update({
    id,
    updatedById,
    data,
  }: {
    id: number
    updatedById: number
    data: UpdatePermissionBodyType
  }): Promise<PermissionType & { roles: { id: number }[] }> {
    return this.prismaService.permission.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
      include: {
        roles: true,
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
  ): Promise<PermissionType & { roles: { id: number }[] }> {
    return isHard
      ? this.prismaService.permission.delete({
          where: {
            id,
          },
          include: {
            roles: true,
          },
        })
      : this.prismaService.permission.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedById,
          },
          include: {
            roles: true,
          },
        })
  }
}
