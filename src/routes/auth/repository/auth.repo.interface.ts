import { RegisterBodyType, DeviceType, RoleType } from '../auth.model'
import { UserType } from 'src/shared/models/shared-user.model'
import { VerificationCodeType } from '../auth.model'
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constants'
import { RefreshTokenType } from '../auth.model'
export interface IAuthRepository {
  createUser(
    user: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>>
  createRefreshToken(token: string, userId: number, expiresAt: Date, deviceId: number): Promise<void>
  findRefreshToken(token: string): Promise<{ userId: number; expiresAt: Date } | null>
  deleteRefreshToken(uniqueObject: { token: string }): Promise<RefreshTokenType | null>
  createVerificationCode(
    payload: Pick<VerificationCodeType, 'email' | 'code' | 'type' | 'expiresAt'>,
  ): Promise<VerificationCodeType>
  findUniqueVerificationCode(
    uniqueValue: { email: string } | { id: number } | { email: string; type: TypeOfVerificationCode; code: string },
  ): Promise<VerificationCodeType | null>
  createDevice(
    payload: Pick<DeviceType, 'userAgent' | 'ip' | 'userId'> & Partial<Pick<DeviceType, 'lastActiveAt' | 'isActive'>>,
  ): Promise<DeviceType | null>
  findUserUniqueUserIncludeRole(
    uniqueObject: { email: string } | { id: number },
  ): Promise<(UserType & { role: RoleType }) | null>
  findUniqueRefreshTokenIncludeUserRole(uniqueObject: {
    token: string
  }): Promise<(RefreshTokenType & { user: UserType & { role: RoleType } }) | null>

  updateDevice(deviceId: number, payload: Partial<DeviceType>): Promise<DeviceType | null>
}
