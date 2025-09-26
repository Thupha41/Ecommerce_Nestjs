import { Module } from '@nestjs/common'
import { ProductTranslationController } from 'src/modules/product/product-translation/product-translation.controller'
import { ProductTranslationRepo } from 'src/modules/product/product-translation/product-translation.repo'
import { ProductTranslationService } from 'src/modules/product/product-translation/product-translation.service'

@Module({
  providers: [ProductTranslationRepo, ProductTranslationService],
  controllers: [ProductTranslationController],
})
export class ProductTranslationModule {}
