import { Module } from '@nestjs/common'
import { BrandTranslationController } from 'src/modules/brand/brand-translation/brand-translation.controller'
import { BrandTranslationRepo } from 'src/modules/brand/brand-translation/brand-translation.repo'
import { BrandTranslationService } from 'src/modules/brand/brand-translation/brand-translation.service'

@Module({
  providers: [BrandTranslationRepo, BrandTranslationService],
  controllers: [BrandTranslationController],
})
export class BrandTranslationModule {}
