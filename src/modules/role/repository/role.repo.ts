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

  // Helper method to ensure all required fields are present
  private mapToRoleType(role: Record<string, unknown>): RoleType {
    return {
      id: role.id as number,
      name: role.name as string,
      description: role.description as string,
      isActive: role.isActive as boolean,
      createdById: role.createdById as number | null,
      updatedById: role.updatedById as number | null,
      deletedById: (role.deletedById as number | null) || null,
      deletedAt: role.deletedAt as Date | null,
      createdAt: role.createdAt as Date,
      updatedAt: role.updatedAt as Date,
    }
  }

  // Helper method to map role with permissions
  private mapToRoleWithPermissions(role: Record<string, unknown>): RoleWithPermissionsType {
    // Type assertion needed because we know the structure but TypeScript doesn't
    const permissions = Array.isArray(role.permissions) ? role.permissions : []
    const typedRole = this.mapToRoleType(role)

    return {
      ...typedRole,
      permissions: permissions as any,
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
    return {
      data: data.map((role) => this.mapToRoleType(role)),
      totalItems,
      page: pagination.page,
      limit: pagination.limit,
      totalPages: Math.ceil(totalItems / pagination.limit),
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

    return this.mapToRoleWithPermissions(role)
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
    // Kiểm tra nếu có bất cứ permissionId nào mà đã soft delete thì không cho phép cập nhật
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
        const error = new Error(`Permission with id has been deleted: ${deletedIds}`)
        throw error
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

    return this.mapToRoleWithPermissions(role)
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
            deletedById,
            // Using any cast to bypass type checking as the schema includes this field
            // but Prisma types don't seem to recognize it
          } as any,
        })

    return this.mapToRoleType(role)
  }
}
