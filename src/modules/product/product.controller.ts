import { Controller, Get, Param, Query } from '@nestjs/common'

import { ZodSerializerDto } from 'nestjs-zod'
import {
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductsQueryDTO,
  GetProductsResDTO,
} from 'src/modules/product/product.dto'
import { ProductService } from 'src/modules/product/product.service'
import { ApiParam, ApiQuery, ApiTags, ApiOperation } from '@nestjs/swagger'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ApiBearerAuth } from '@nestjs/swagger'


@ApiBearerAuth()
@Controller('products')
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
  list(@Query() query: GetProductsQueryDTO, @ActiveUser('userId') userId?: number) {
    return this.productService.list({
      query,
      userId,
    })
  }

  @Get(':productId')
  @ApiParam({ name: 'productId', required: true, type: Number })
  @ApiOperation({ summary: 'List detail product', description: 'Get product detail' })
  @ZodSerializerDto(GetProductDetailResDTO)
  @ResponseMessage('Product fetched successfully')
  findById(@Param() params: GetProductParamsDTO, @ActiveUser('userId') userId?: number) {
    return this.productService.getDetail({
      productId: params.productId,
      userId,
    })
  }
}
