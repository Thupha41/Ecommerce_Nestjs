import { RegisterBodyType } from '../auth.model'
import { UserType } from 'src/shared/models/shared-user.model'
import { VerificationCodeType } from '../auth.model'
export interface IAuthRepository {
  createUser(
    user: Omit<RegisterBodyType, 'confirmPassword'> & Pick<UserType, 'roleId'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>>
  createRefreshToken(token: string, userId: number, expiresAt: Date): Promise<void>
  findRefreshToken(token: string): Promise<{ userId: number; expiresAt: Date } | null>
  deleteRefreshToken(token: string): Promise<void>
  createVerificationCode(
    payload: Pick<VerificationCodeType, 'email' | 'code' | 'type' | 'expiresAt'>,
  ): Promise<VerificationCodeType>
}
