import { Injectable } from '@nestjs/common'
import { NotFoundRecordException } from 'src/shared/error'
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers'
import { DiscountTranslationRepo } from 'src/modules/discount/discount-translation/discount-translation.repo'
import { DiscountTranslationAlreadyExistsException } from 'src/modules/discount/models/discount-translation.error.model'
import {
  CreateDiscountTranslationBodyType,
  UpdateDiscountTranslationBodyType,
} from 'src/modules/discount/models/discount-translation.model'

@Injectable()
export class DiscountTranslationService {
  constructor(private discountTranslationRepo: DiscountTranslationRepo) {}

  async findById(id: number) {
    const discount = await this.discountTranslationRepo.findById(id)
    if (!discount) {
      throw NotFoundRecordException
    }
    return discount
  }

  async create({ data, createdById }: { data: CreateDiscountTranslationBodyType; createdById: number }) {
    try {
      return await this.discountTranslationRepo.create({
        createdById,
        data,
      })
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw DiscountTranslationAlreadyExistsException
      }
      throw error
    }
  }

  async update({
    id,
    data,
    updatedById,
  }: {
    id: number
    data: UpdateDiscountTranslationBodyType
    updatedById: number
  }) {
    try {
      const discount = await this.discountTranslationRepo.update({
        id,
        updatedById,
        data,
      })
      return discount
    } catch (error) {
      if (isUniqueConstraintPrismaError(error)) {
        throw DiscountTranslationAlreadyExistsException
      }
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }

  async delete({ id, deletedById }: { id: number; deletedById: number }) {
    try {
      return await this.discountTranslationRepo.delete({
        id,
        deletedById,
      })
    } catch (error) {
      if (isNotFoundPrismaError(error)) {
        throw NotFoundRecordException
      }
      throw error
    }
  }
}
