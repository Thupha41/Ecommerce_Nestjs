import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { DeviceType, RegisterBodyType, RoleType, VerificationCodeType } from '../auth.model'
import { IAuthRepository } from './auth.repo.interface'
import { UserType } from 'src/shared/models/shared-user.model'
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constants'

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(
    user: Omit<RegisterBodyType, 'confirmPassword' | 'code'> & Pick<UserType, 'roleId'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return await this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    })
  }

  async createRefreshToken(token: string, userId: number, expiresAt: Date, deviceId: number): Promise<void> {
    await this.prismaService.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
        deviceId,
      },
    })
  }

  async findRefreshToken(token: string): Promise<{ userId: number; expiresAt: Date } | null> {
    const refreshToken = await this.prismaService.refreshToken.findUniqueOrThrow({
      where: { token },
    })
    return refreshToken ? { userId: refreshToken.userId, expiresAt: refreshToken.expiresAt } : null
  }

  async deleteRefreshToken(token: string): Promise<void> {
    await this.prismaService.refreshToken.delete({
      where: { token },
    })
  }

  async createVerificationCode(
    payload: Pick<VerificationCodeType, 'email' | 'code' | 'type' | 'expiresAt'>,
  ): Promise<VerificationCodeType> {
    return await this.prismaService.verificationCode.upsert({
      where: { email: payload.email },
      create: payload,
      update: {
        code: payload.code,
        expiresAt: payload.expiresAt,
      },
    })
  }

  async findUniqueVerificationCode(
    uniqueValue: { email: string } | { id: number } | { email: string; type: TypeOfVerificationCode; code: string },
  ): Promise<VerificationCodeType | null> {
    return await this.prismaService.verificationCode.findUnique({
      where: uniqueValue,
    })
  }

  async createDevice(
    payload: Pick<DeviceType, 'userAgent' | 'ip' | 'userId'> & Partial<Pick<DeviceType, 'lastActiveAt' | 'isActive'>>,
  ): Promise<DeviceType> {
    const device = await this.prismaService.device.create({
      data: payload,
    })

    return device as DeviceType
  }

  async findUserUniqueUserIncludeRole(
    uniqueObject: { email: string } | { id: number },
  ): Promise<(UserType & { role: RoleType }) | null> {
    return await this.prismaService.user.findUnique({
      where: uniqueObject,
      include: {
        role: true,
      },
    })
  }
}
