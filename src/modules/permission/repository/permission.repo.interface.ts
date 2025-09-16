import {
  CreatePermissionBodyType,
  GetPermissionsQueryType,
  GetPermissionsResType,
  UpdatePermissionBodyType,
} from '../models/permission.model'
import { PermissionType } from 'src/shared/models/shared-permission.model'

export interface IPermissionRepository {
  list(pagination: GetPermissionsQueryType): Promise<GetPermissionsResType>
  findById(id: number): Promise<PermissionType | null>
  create({ createdById, data }: { createdById: number; data: CreatePermissionBodyType }): Promise<PermissionType>
  update({
    id,
    updatedById,
    data,
  }: {
    id: number
    updatedById: number
    data: UpdatePermissionBodyType
  }): Promise<PermissionType>
  delete(
    {
      id,
      deletedById,
    }: {
      id: number
      deletedById: number
    },
    isHard?: boolean,
  ): Promise<PermissionType>
}
