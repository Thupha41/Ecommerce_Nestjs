import { UserType } from '../models/shared-user.model'
import { WhereUniqueUserType } from './shared-user.repo'
import { RoleType } from '../models/shared-role.model'
import { PermissionType } from '../models/shared-permission.model'
export type UserIncludeRolePermissionsType = UserType & { role: RoleType & { permissions: PermissionType[] } }
export interface ISharedUserRepository {
  findUserUnique(uniqueObject: { email: string } | { id: number }): Promise<UserType | null>
  findUniqueIncludeRolePermissions(where: WhereUniqueUserType): Promise<UserIncludeRolePermissionsType | null>
  update(where: { id: number }, data: Partial<UserType>): Promise<UserType | null>
}
