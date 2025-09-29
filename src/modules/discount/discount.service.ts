import { Injectable } from '@nestjs/common'
import { DiscountRepo } from './discount.repo'
import {
  CreateDiscountBodyType,
  GetAllDiscountsResType,
  GetDiscountDetailResType,
  GetDiscountsQueryType,
  UpdateDiscountBodyType,
} from './models/discount.model'

@Injectable()
export class DiscountService {
  constructor(private readonly discountRepo: DiscountRepo) {}

  async create(payload: CreateDiscountBodyType, createdById: number): Promise<GetDiscountDetailResType> {
    return this.discountRepo.create(payload, createdById)
  }

  async update(id: number, payload: UpdateDiscountBodyType, updatedById: number): Promise<GetDiscountDetailResType> {
    return this.discountRepo.update({ id, updatedById, data: payload })
  }

  delete({ id, deletedById }: { id: number; deletedById: number }, isHard: boolean = false) {
    return this.discountRepo.delete({ id, deletedById }, isHard)
  }

  async list(query: GetDiscountsQueryType): Promise<GetAllDiscountsResType> {
    return this.discountRepo.list(query)
  }
}
