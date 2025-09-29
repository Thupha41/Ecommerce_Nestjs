import { Module } from '@nestjs/common'
import { DiscountController } from './discount.controller'
import { DiscountService } from './discount.service'
import { DiscountRepo } from './discount.repo'

@Module({
  controllers: [DiscountController],
  providers: [DiscountService, DiscountRepo],
})
export class DiscountModule {}
