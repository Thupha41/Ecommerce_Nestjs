import { Injectable } from '@nestjs/common'
import {
  CreateRoleBodyType,
  GetRolesQueryType,
  GetRolesResType,
  RoleWithPermissionsType,
  UpdateRoleBodyType,
} from 'src/modules/role/models/role.model'
import { RoleType } from 'src/shared/models/shared-role.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { IRoleRepository } from './role.repo.interface'

@Injectable()
export class RoleRepo implements IRoleRepository {
  constructor(private prismaService: PrismaService) {}

  private mapToRoleType(role: any): RoleType {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isActive: role.isActive,
      createdById: role.createdById,
      updatedById: role.updatedById,
      deletedById: role.deletedById ?? null,
      deletedAt: role.deletedAt,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    }
  }

  async list(pagination: GetRolesQueryType): Promise<GetRolesResType> {
    const skip = (pagination.page - 1) * pagination.limit
    const take = pagination.limit
    const [totalItems, data] = await Promise.all([
      this.prismaService.role.count({
        where: {
          deletedAt: null,
        },
      }),
      this.prismaService.role.findMany({
        where: {
          deletedAt: null,
        },
        skip,
        take,
      }),
    ])

    const mappedData = data.map((role) => this.mapToRoleType(role))

    return {
      data: mappedData,
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
    }
  }

  // Helper method để map permission
  private mapToPermissionType(permission: any) {
    return {
      id: permission.id,
      name: permission.name,
      description: permission.description,
      path: permission.path,
      method: permission.method,
      module: permission.module || '', // Đảm bảo module luôn có giá trị
      createdById: permission.createdById,
      updatedById: permission.updatedById,
      deletedById: permission.deletedById ?? null,
      deletedAt: permission.deletedAt,
      createdAt: permission.createdAt,
      updatedAt: permission.updatedAt,
    }
  }

  async findById(id: number): Promise<RoleWithPermissionsType | null> {
    const role = await this.prismaService.role.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        permissions: {
          where: {
            deletedAt: null,
          },
        },
      },
    })

    if (!role) return null

    const mappedRole = this.mapToRoleType(role)
    const mappedPermissions = role.permissions.map((permission) => this.mapToPermissionType(permission))

    return {
      ...mappedRole,
      permissions: mappedPermissions,
    }
  }

  async create({ createdById, data }: { createdById: number | null; data: CreateRoleBodyType }): Promise<RoleType> {
    const role = await this.prismaService.role.create({
      data: {
        ...data,
        createdById,
      },
    })
    return this.mapToRoleType(role)
  }

  async update({
    id,
    updatedById,
    data,
  }: {
    id: number
    updatedById: number
    data: UpdateRoleBodyType
  }): Promise<RoleType> {
    if (data.permissionIds.length > 0) {
      const permissions = await this.prismaService.permission.findMany({
        where: {
          id: {
            in: data.permissionIds,
          },
        },
      })
      const deletedPermission = permissions.filter((permission) => permission.deletedAt)
      if (deletedPermission.length > 0) {
        const deletedIds = deletedPermission.map((permission) => permission.id).join(', ')
        throw new Error(`Permission with id has been deleted: ${deletedIds}`)
      }
    }

    const role = await this.prismaService.role.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        name: data.name,
        description: data.description,
        isActive: data.isActive,
        permissions: {
          set: data.permissionIds.map((id) => ({ id })),
        },
        updatedById,
      },
      include: {
        permissions: {
          where: {
            deletedAt: null,
          },
        },
      },
    })

    const mappedPermissions = role.permissions.map((permission) => this.mapToPermissionType(permission))
    const mappedRole = this.mapToRoleType(role)

    return {
      ...mappedRole,
      permissions: mappedPermissions,
    } as RoleWithPermissionsType
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
  ): Promise<RoleType> {
    const role = isHard
      ? await this.prismaService.role.delete({
          where: {
            id,
          },
        })
      : await this.prismaService.role.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedById: deletedById,
          } as any,
        })

    return this.mapToRoleType(role)
  }
}
