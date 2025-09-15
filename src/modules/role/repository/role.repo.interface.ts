import {
  CreateRoleBodyType,
  GetRolesQueryType,
  GetRolesResType,
  RoleWithPermissionsType,
  UpdateRoleBodyType,
} from 'src/modules/role/models/role.model'
import { RoleType } from 'src/shared/models/shared-role.model'

export interface IRoleRepository {
  list(pagination: GetRolesQueryType): Promise<GetRolesResType>
  findById(id: number): Promise<RoleWithPermissionsType | null>
  create({ createdById, data }: { createdById: number | null; data: CreateRoleBodyType }): Promise<RoleType>
  update({ id, updatedById, data }: { id: number; updatedById: number; data: UpdateRoleBodyType }): Promise<RoleType>
  delete(
    {
      id,
      deletedById,
    }: {
      id: number
      deletedById: number
    },
    isHard?: boolean,
  ): Promise<RoleType>
}
