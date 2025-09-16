import { GetUsersQueryType, GetUsersResType } from 'src/modules/user/models/user.model'
import { UserType } from 'src/shared/models/shared-user.model'
import { CreateUserBodyType } from 'src/modules/user/models/user.model'

export interface IUserRepository {
  list(pagination: GetUsersQueryType): Promise<GetUsersResType>
  create({ createdById, data }: { createdById: number | null; data: CreateUserBodyType }): Promise<UserType>
  delete({ id, deletedById }: { id: number; deletedById: number }, isHard?: boolean): Promise<UserType>
}
