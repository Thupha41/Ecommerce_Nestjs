import { RegisterBodyType, DeviceType } from '../models/auth.model'
import { RoleType } from 'src/shared/models/shared-role.model'
import { UserType } from 'src/shared/models/shared-user.model'
import { VerificationCodeType } from '../models/auth.model'
import { TypeOfVerificationCodeType } from 'src/shared/constants/auth.constants'
import { RefreshTokenType } from '../models/auth.model'
import { WhereUniqueUserType } from 'src/shared/repositories/shared-user.repo'
export interface IAuthRepository {
  createUser(
    user: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>>
  createUserIncludeRole(
    user: Pick<UserType, 'name' | 'email' | 'password' | 'phoneNumber' | 'roleId' | 'avatar'>,
  ): Promise<UserType & { role: RoleType }>
  createRefreshToken(token: string, userId: number, expiresAt: Date, deviceId: number): Promise<void>
  findRefreshToken(token: string): Promise<{ userId: number; expiresAt: Date } | null>
  deleteRefreshToken(uniqueObject: { token: string }): Promise<RefreshTokenType | null>
  createVerificationCode(
    payload: Pick<VerificationCodeType, 'email' | 'type' | 'code' | 'expiresAt'>,
  ): Promise<VerificationCodeType>
  findUniqueVerificationCode(
    uniqueValue: { id: number } | { email_type: { email: string; type: TypeOfVerificationCodeType } },
  ): Promise<VerificationCodeType | null>
  createDevice(
    payload: Pick<DeviceType, 'userAgent' | 'ip' | 'userId'> & Partial<Pick<DeviceType, 'lastActive' | 'isActive'>>,
  ): Promise<DeviceType | null>
  findUniqueUserIncludeRole(uniqueObject: WhereUniqueUserType): Promise<(UserType & { role: RoleType }) | null>
  findUniqueRefreshTokenIncludeUserRole(uniqueObject: {
    token: string
  }): Promise<(RefreshTokenType & { user: UserType & { role: RoleType } }) | null>

  updateDevice(deviceId: number, payload: Partial<DeviceType>): Promise<DeviceType | null>

  deleteVerificationCode(
    where: { id: number } | { email_type: { email: string; type: TypeOfVerificationCodeType } },
  ): Promise<VerificationCodeType | null>
}
