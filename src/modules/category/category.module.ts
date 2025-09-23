import { Module } from '@nestjs/common'
import { CategoryController } from 'src/modules/category/category.controller'
import { CategoryRepo } from 'src/modules/category/category.repo'
import { CategoryService } from 'src/modules/category/category.service'

@Module({
  providers: [CategoryService, CategoryRepo],
  controllers: [CategoryController],
})
export class CategoryModule {}
