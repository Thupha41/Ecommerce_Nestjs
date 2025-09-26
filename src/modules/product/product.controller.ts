import { Controller, Get, Param, Query } from '@nestjs/common'
import { SkipThrottle } from '@nestjs/throttler'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductsQueryDTO,
  GetProductsResDTO,
} from 'src/modules/product/product.dto'
import { ProductService } from 'src/modules/product/product.service'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { ApiTags } from '@nestjs/swagger'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'

@SkipThrottle()
@Controller('products')
@IsPublic()
@ApiTags('Products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ZodSerializerDto(GetProductsResDTO)
  @ResponseMessage('Products fetched successfully')
  list(@Query() query: GetProductsQueryDTO) {
    return this.productService.list({
      query,
    })
  }

  @SkipThrottle({ default: false })
  @Get(':productId')
  @ZodSerializerDto(GetProductDetailResDTO)
  @ResponseMessage('Product fetched successfully')
  findById(@Param() params: GetProductParamsDTO) {
    return this.productService.getDetail({
      productId: params.productId,
    })
  }
}
