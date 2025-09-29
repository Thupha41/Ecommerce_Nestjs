import { Module } from '@nestjs/common'
import { DiscountTranslationController } from './discount-translation.controller'
import { DiscountTranslationService } from './discount-translation.service'
import { DiscountTranslationRepo } from './discount-translation.repo'

@Module({
  controllers: [DiscountTranslationController],
  providers: [DiscountTranslationService, DiscountTranslationRepo],
})
export class DiscountTranslationModule {}
