import { Injectable } from '@nestjs/common'
import {
  CreateLanguageBodyType,
  LanguageType,
  UpdateLanguageBodyType,
} from 'src/modules/language/models/language.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { ILanguageRepository } from './language.repo.interface'

@Injectable()
export class LanguageRepo implements ILanguageRepository {
  constructor(private prismaService: PrismaService) {}

  findAll(): Promise<LanguageType[]> {
    return this.prismaService.language.findMany({
      where: {
        deletedAt: null,
      },
    })
  }

  findById(id: string): Promise<LanguageType | null> {
    return this.prismaService.language.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })
  }

  create({ createdById, data }: { createdById: number; data: CreateLanguageBodyType }): Promise<LanguageType> {
    return this.prismaService.language.create({
      data: {
        ...data,
        createdById,
      },
    })
  }

  update({
    id,
    updatedById,
    data,
  }: {
    id: string
    updatedById: number
    data: UpdateLanguageBodyType
  }): Promise<LanguageType> {
    return this.prismaService.language.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
    })
  }

  delete(id: string, isHard?: boolean): Promise<LanguageType> {
    return isHard
      ? this.prismaService.language.delete({
          where: {
            id,
          },
        })
      : this.prismaService.language.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
          },
        })
  }
}
