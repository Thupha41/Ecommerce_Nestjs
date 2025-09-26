import { Module } from '@nestjs/common'
import { ManageProductController } from 'src/modules/product/manage-product.controller'
import { ManageProductService } from 'src/modules/product/manage-product.service'
import { ProductController } from 'src/modules/product/product.controller'
import { ProductRepo } from 'src/modules/product/product.repo'
import { ProductService } from 'src/modules/product/product.service'

@Module({
  providers: [ProductService, ManageProductService, ProductRepo],
  controllers: [ProductController, ManageProductController],
})
export class ProductModule {}
