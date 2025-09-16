import { Inject, Injectable } from '@nestjs/common'
import { CreatePermissionBodyType, GetPermissionsQueryType, UpdatePermissionBodyType } from './models/permission.model'
import { PermissionAlreadyExistsException, PermissionNotFoundException } from './models/permission.error.model'
import { IPermissionRepository } from './repository/permission.repo.interface'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'

@Injectable()
export class PermissionService {
  constructor(@Inject('IPermissionRepository') private readonly permissionRepository: IPermissionRepository) {}

  async list(pagination: GetPermissionsQueryType) {
    const data = await this.permissionRepository.list(pagination)
    return data
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
      return permission
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw PermissionNotFoundException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      await this.permissionRepository.delete({ id, deletedById }, true)
      return {
        message: 'Delete permission successfully',
      }
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw PermissionNotFoundException
      }
      throw error
    }
  }
}
