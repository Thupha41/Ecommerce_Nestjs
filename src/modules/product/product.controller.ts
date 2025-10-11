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
import { ApiParam, ApiQuery, ApiTags, ApiOperation } from '@nestjs/swagger'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'

@SkipThrottle()
@Controller('products')
@IsPublic()
@ApiTags('Products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  @ZodSerializerDto(GetProductsResDTO)
  @ApiOperation({ summary: 'List products', description: 'Get a list of products with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'name', required: false, type: String })
  @ApiQuery({ name: 'brandIds', required: false, type: [Number] })
  @ApiQuery({ name: 'categories', required: false, type: [Number] })
  @ApiQuery({ name: 'minPrice', required: false, type: Number })
  @ApiQuery({ name: 'maxPrice', required: false, type: Number })
  @ApiQuery({ name: 'createdById', required: false, type: Number })
  @ApiQuery({ name: 'isPublic', required: false, type: Boolean })
  @ApiQuery({ name: 'orderBy', required: false, type: String })
  @ApiQuery({ name: 'sortBy', required: false, type: String })
  @ResponseMessage('Products fetched successfully')
  list(@Query() query: GetProductsQueryDTO) {
    return this.productService.list({
      query,
    })
  }

  @Get(':productId')
  @ApiParam({ name: 'productId', required: true, type: Number })
  @ApiOperation({ summary: 'List detail product', description: 'Get product detail' })
  @ZodSerializerDto(GetProductDetailResDTO)
  @ResponseMessage('Product fetched successfully')
  findById(@Param() params: GetProductParamsDTO) {
    return this.productService.getDetail({
      productId: params.productId,
    })
  }
}
