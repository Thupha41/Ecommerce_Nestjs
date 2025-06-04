import { RegisterBodyType, UserType } from '../auth.model'

export interface IAuthRepository {
  createUser(
    user: Omit<RegisterBodyType, 'confirmPassword'> & Pick<UserType, 'roleId'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>>
  findUserByEmail(email: string): Promise<UserType | null>
  createRefreshToken(token: string, userId: number, expiresAt: Date): Promise<void>
  findRefreshToken(token: string): Promise<{ userId: number; expiresAt: Date } | null>
  deleteRefreshToken(token: string): Promise<void>
}
