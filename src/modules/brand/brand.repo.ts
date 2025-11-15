import { Injectable } from '@nestjs/common'
import { Prisma } from '@prisma/client'
import {
  CreateBrandBodyType,
  GetBrandsResType,
  UpdateBrandBodyType,
  BrandType,
  BrandIncludeTranslationType,
} from 'src/modules/brand/models/brand.model'
import { ALL_LANGUAGE_CODE, OrderByType, SortBy, SortByType } from 'src/shared/constants/other.constant'
import { PrismaService } from 'src/shared/services/prisma.service'

@Injectable()
export class BrandRepo {
  constructor(private prismaService: PrismaService) {}

  async list({
    limit,
    page,
    name,
    languageId,
    orderBy,
    sortBy,
  }: {
    limit: number
    page: number
    name?: string
    languageId: string
    orderBy: OrderByType
    sortBy: SortByType
  }): Promise<GetBrandsResType> {
    const skip = (page - 1) * limit
    const take = limit
    let where: Prisma.BrandWhereInput = {
      deletedAt: null,
    }
    if (name) {
      where.name = {
        contains: name,
        mode: 'insensitive',
      }
    }
    // Mặc định sort theo createdAt mới nhất
    let caculatedOrderBy: Prisma.BrandOrderByWithRelationInput = {
      createdAt: orderBy,
    }
    if (sortBy === SortBy.Name) {
      caculatedOrderBy = {
        name: orderBy,
      }
    }
    const [totalItems, data] = await Promise.all([
      this.prismaService.brand.count({
        where,
      }),
      this.prismaService.brand.findMany({
        where,
        include: {
          brandTranslations: {
            where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
          },
        },
        orderBy: caculatedOrderBy,
        skip,
        take,
      }),
    ])
    return {
      items: data,
      totalItems,
      page: page,
      limit: limit,
      totalPages: Math.ceil(totalItems / limit),
    }
  }

  findById(id: number, languageId: string): Promise<BrandIncludeTranslationType | null> {
    return this.prismaService.brand.findUnique({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        brandTranslations: {
          where: languageId === ALL_LANGUAGE_CODE ? { deletedAt: null } : { deletedAt: null, languageId },
        },
      },
    })
  }

  create({
    createdById,
    data,
  }: {
    createdById: number | null
    data: CreateBrandBodyType
  }): Promise<BrandIncludeTranslationType> {
    return this.prismaService.brand.create({
      data: {
        ...data,
        createdById,
      },
      include: {
        brandTranslations: {
          where: { deletedAt: null },
        },
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
    data: UpdateBrandBodyType
  }): Promise<BrandIncludeTranslationType> {
    return this.prismaService.brand.update({
      where: {
        id,
        deletedAt: null,
      },
      data: {
        ...data,
        updatedById,
      },
      include: {
        brandTranslations: {
          where: { deletedAt: null },
        },
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
  ): Promise<BrandType> {
    return isHard
      ? this.prismaService.brand.delete({
          where: {
            id,
          },
        })
      : this.prismaService.brand.update({
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
