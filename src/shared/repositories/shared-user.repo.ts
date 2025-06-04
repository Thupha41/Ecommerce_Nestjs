import { Injectable } from '@nestjs/common'
import { ISharedUserRepository } from './shared-user.repo.interface'
import { PrismaService } from '../services/prisma.service'
import { UserType } from '../models/shared-user.model'

@Injectable()
export class SharedUserRepository implements ISharedUserRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findUserUnique(uniqueObject: { email: string } | { id: number }): Promise<UserType | null> {
    return await this.prismaService.user.findUnique({
      where: uniqueObject,
    })
  }
}
