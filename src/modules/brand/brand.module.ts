import { Module } from '@nestjs/common'
import { BrandController } from 'src/modules/brand/brand.controller'
import { BrandRepo } from 'src/modules/brand/brand.repo'
import { BrandService } from 'src/modules/brand/brand.service'

@Module({
  providers: [BrandService, BrandRepo],
  controllers: [BrandController],
})
export class BrandModule {}
