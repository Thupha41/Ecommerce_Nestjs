import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { DeviceType, RefreshTokenType, RegisterBodyType, RoleType, VerificationCodeType } from '../models/auth.model'
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

  async createUserIncludeRole(
    user: Pick<UserType, 'name' | 'email' | 'password' | 'phoneNumber' | 'roleId' | 'avatar'>,
  ): Promise<UserType & { role: RoleType }> {
    return await this.prismaService.user.create({
      data: user,
      include: {
        role: true,
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

  async deleteRefreshToken(uniqueObject: { token: string }): Promise<RefreshTokenType | null> {
    return await this.prismaService.refreshToken.delete({
      where: uniqueObject,
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
      data: {
        userId: payload.userId,
        userAgent: payload.userAgent,
        ip: payload.ip,
        lastActiveAt: payload.lastActiveAt ?? new Date(),
        isActive: payload.isActive,
      },
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

  async findUniqueRefreshTokenIncludeUserRole(uniqueObject: {
    token: string
  }): Promise<(RefreshTokenType & { user: UserType & { role: RoleType } }) | null> {
    return await this.prismaService.refreshToken.findUnique({
      where: uniqueObject,
      include: {
        user: {
          include: {
            role: true,
          },
        },
      },
    })
  }

  async updateDevice(deviceId: number, payload: Partial<DeviceType>): Promise<DeviceType | null> {
    const updateData = payload

    return await this.prismaService.device.update({
      where: { id: deviceId },
      data: {
        ...updateData,
        lastActiveAt: payload.lastActiveAt ?? undefined,
      },
    })
  }
}
