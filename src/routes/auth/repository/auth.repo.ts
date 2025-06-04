import { Injectable } from '@nestjs/common'
import { PrismaService } from 'src/shared/services/prisma.service'
import { RegisterBodyType, VerificationCodeType } from '../auth.model'
import { IAuthRepository } from './auth.repo.interface'
import { UserType } from 'src/shared/models/shared-user.model'

@Injectable()
export class AuthRepository implements IAuthRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async createUser(
    user: Omit<RegisterBodyType, 'confirmPassword'> & Pick<UserType, 'roleId'>,
  ): Promise<Omit<UserType, 'password' | 'totpSecret'>> {
    return await this.prismaService.user.create({
      data: user,
      omit: {
        password: true,
        totpSecret: true,
      },
    })
  }

  async createRefreshToken(token: string, userId: number, expiresAt: Date): Promise<void> {
    await this.prismaService.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
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
}
