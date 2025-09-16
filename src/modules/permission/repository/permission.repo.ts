import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { IPermissionRepository } from './permission.repo.interface'
import {
  CreatePermissionBodyType,
  GetPermissionQueryType,
  GetPermissionResType,
  PermissionType,
  UpdatePermissionBodyType,
} from '../models/permission.model'

@Injectable()
export class PermissionRepository implements IPermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  // Helper method để đảm bảo tất cả các trường cần thiết đều có mặt
  private mapToPermissionType(permission: any): PermissionType {
    return {
      id: permission.id,
      name: permission.name,
      description: permission.description,
      path: permission.path,
      method: permission.method,
      module: permission.module || '', // Đảm bảo module luôn có giá trị
      createdById: permission.createdById,
      updatedById: permission.updatedById,
      // deletedById không nằm trong PermissionType nên không thêm vào
      deletedAt: permission.deletedAt,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    }
  }

  async list(pagination: GetPermissionQueryType): Promise<GetPermissionResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.permission.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.permission.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take,
      }),
    ])

    // Đảm bảo mỗi permission đều có đầy đủ các trường
    const mappedData = data.map((permission) => this.mapToPermissionType(permission))

    return {
      data: mappedData,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    }
  }

  async findById(id: number): Promise<PermissionType | null> {
    const permission = await this.prismaService.permission.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })

    if (!permission) return null

    return this.mapToPermissionType(permission)
  }

  async create({
    createdById,
    data,
  }: {
    createdById: number
    data: CreatePermissionBodyType
  }): Promise<PermissionType> {
    const permission = await this.prismaService.permission.create({
      data: {
        ...data,
        createdById,
      },
    })

    return this.mapToPermissionType(permission)
  }

  async update({
    id,
    updatedById,
    data,
  }: {
    id: number
    updatedById: number
    data: UpdatePermissionBodyType
  }): Promise<PermissionType> {
    const permission = await this.prismaService.permission.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
    })

    return this.mapToPermissionType(permission)
  }

  async delete(
    {
      id,
      deletedById,
    }: {
      id: number
      deletedById: number
    },
    isHard?: boolean,
  ): Promise<PermissionType> {
    const permission = isHard
      ? await this.prismaService.permission.delete({
          where: {
            id,
          },
        })
      : await this.prismaService.permission.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            updatedById: deletedById,
            deletedById: deletedById,
          } as any,
        })

    return this.mapToPermissionType(permission)
  }
}
