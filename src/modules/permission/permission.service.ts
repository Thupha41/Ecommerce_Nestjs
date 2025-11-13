import { Inject, Injectable } from '@nestjs/common'
import { CreatePermissionBodyType, GetPermissionsQueryType, UpdatePermissionBodyType } from './models/permission.model'
import { PermissionAlreadyExistsException, PermissionNotFoundException } from './models/permission.error.model'
import { IPermissionRepository } from './repository/permission.repo.interface'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import { Cache } from 'cache-manager'

@Injectable()
export class PermissionService {
  constructor(
    @Inject('IPermissionRepository') private readonly permissionRepository: IPermissionRepository,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}
  deleteCachedRole(roles: { id: number }[]) {
    return Promise.all(
      roles.map((role) => {
        const cacheKey = `role:${role.id}`
        return this.cacheManager.del(cacheKey)
      }),
    )
  }
  async list(pagination: GetPermissionsQueryType) {
    const data = await this.permissionRepository.list(pagination)
    return data
  }

  async getModules() {
    return await this.permissionRepository.getDistinctModules()
  }

  async getMethods() {
    return await this.permissionRepository.getDistinctMethods()
  }

  async findById(id: number) {
    const permission = await this.permissionRepository.findById(id)
    if (!permission) {
      throw PermissionNotFoundException
    }
    return permission
  }

  async create({ data, createdById }: { data: CreatePermissionBodyType; createdById: number }) {
    try {
      const permission = await this.permissionRepository.create({ data, createdById })
      return permission
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException
      }
      throw error
    }
  }

  async update({ id, updatedById, data }: { id: number; updatedById: number; data: UpdatePermissionBodyType }) {
    try {
      const permission = await this.permissionRepository.update({ id, updatedById, data })
      const { roles } = permission
      await this.deleteCachedRole(roles)
      return permission
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw PermissionNotFoundException
      }
      if (isUniqueConstraintPrismaError(error)) {
        throw PermissionAlreadyExistsException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      const permission = await this.permissionRepository.delete({
        id,
        deletedById,
      })
      const { roles } = permission
      await this.deleteCachedRole(roles)
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw PermissionNotFoundException
      }
      throw error
    }
  }
}
