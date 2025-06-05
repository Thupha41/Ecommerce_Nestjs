import { UserType } from '../models/shared-user.model'

export interface ISharedUserRepository {
  findUserUnique(uniqueObject: { email: string } | { id: number }): Promise<UserType | null>
}
