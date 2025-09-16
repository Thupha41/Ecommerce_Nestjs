import { Injectable } from '@nestjs/common'
import { ISharedUserRepository } from './shared-user.repo.interface'
import { PrismaService } from '../services/prisma.service'
import { UserType } from '../models/shared-user.model'
import { UserIncludeRolePermissionsType } from './shared-user.repo.interface'
export type WhereUniqueUserType = { id: number } | { email: string }
@Injectable()
export class SharedUserRepository implements ISharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserUnique(uniqueObject: { email: string } | { id: number }): Promise<UserType | null> {
    return await this.prismaService.user.findUnique({
      where: uniqueObject,
    })
  }
  async findUniqueIncludeRolePermissions(where: WhereUniqueUserType): Promise<UserIncludeRolePermissionsType | null> {
    const user = await this.prismaService.user.findFirst({
      where: {
        ...where,
        deletedAt: null,
      },
      include: {
        role: {
          include: {
            permissions: {
              where: {
                deletedAt: null,
              },
            },
          },
        },
      },
    })

    if (!user) return null

    // Map permissions để đảm bảo đủ các trường cần thiết
    const mappedPermissions = user.role.permissions.map((permission) => ({
      ...permission,
      module: '', // Thêm trường module mặc định
      deletedById: permission.deletedById ?? null,
    }))

    // Tạo đối tượng mới với các trường đã được map
    return {
      ...user,
      role: {
        ...user.role,
        // Đảm bảo có đầy đủ các trường theo RoleType
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
        isActive: user.role.isActive,
        createdById: user.role.createdById,
        updatedById: user.role.updatedById,
        deletedById: null, // Gán giá trị mặc định
        deletedAt: user.role.deletedAt,
        createdAt: user.role.createdAt,
        updatedAt: user.role.updatedAt,
        permissions: mappedPermissions,
      },
    } as UserIncludeRolePermissionsType
  }

  update(where: { id: number }, data: Partial<UserType>): Promise<UserType | null> {
    return this.prismaService.user.update({
      where: {
        ...where,
        deletedAt: null,
      },
      data,
    })
  }
}
