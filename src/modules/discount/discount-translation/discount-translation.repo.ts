import { Injectable } from '@nestjs/common'
import {
  GetDiscountTranslationDetailResType,
  CreateDiscountTranslationBodyType,
  UpdateDiscountTranslationBodyType,
  DiscountTranslationType,
} from 'src/modules/discount/models/discount-translation.model'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class DiscountTranslationRepo {
  constructor(private prismaService: PrismaService) {}

  findById(id: number): Promise<GetDiscountTranslationDetailResType | null> {
    return this.prismaService.discountTranslation.findUnique({
      where: {
        id,
        deletedAt: null,
      },
    })
  }

  create({
    createdById,
    data,
  }: {
    createdById: number | null
    data: CreateDiscountTranslationBodyType
  }): Promise<DiscountTranslationType> {
    return this.prismaService.discountTranslation.create({
      data: {
        ...data,
        createdById,
      },
    })
  }

  async update({
    id,
    updatedById,
    data,
  }: {
    id: number
    updatedById: number
    data: UpdateDiscountTranslationBodyType
  }): Promise<DiscountTranslationType> {
    return this.prismaService.discountTranslation.update({
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

  delete(
    {
      id,
      deletedById,
    }: {
      id: number
      deletedById: number
    },
    isHard?: boolean,
  ): Promise<DiscountTranslationType> {
    return isHard
      ? this.prismaService.discountTranslation.delete({
          where: {
            id,
          },
        })
      : this.prismaService.discountTranslation.update({
          where: {
            id,
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
            deletedById,
          },
        })
  }
}
