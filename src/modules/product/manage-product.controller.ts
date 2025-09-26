import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import { ManageProductService } from 'src/modules/product/manage-product.service'
import {
  CreateProductBodyDTO,
  GetManageProductsQueryDTO,
  GetProductDetailResDTO,
  GetProductParamsDTO,
  GetProductsResDTO,
  ProductDTO,
  UpdateProductBodyDTO,
} from 'src/modules/product/product.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { IAccessTokenPayload } from 'src/shared/types/jwt.types'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { ApiBearerAuth, ApiParam, ApiTags, ApiBody, ApiOperation } from '@nestjs/swagger'
import { UseGuards } from '@nestjs/common'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'

@Controller('manage-product/products')
@UseGuards(AccessTokenGuard)
@ApiBearerAuth()
@ApiTags('Manage Product')
export class ManageProductController {
  constructor(private readonly manageProductService: ManageProductService) {}

  @Get()
  @ApiOperation({ summary: 'List products', description: 'Get a list of products with pagination / Admin Only' })
  @ZodSerializerDto(GetProductsResDTO)
  @ResponseMessage('Products fetched successfully')
  list(@Query() query: GetManageProductsQueryDTO, @ActiveUser() user: IAccessTokenPayload) {
    return this.manageProductService.list({
      query,
      roleNameRequest: user.roleName,
      userIdRequest: user.userId,
    })
  }

  @Get(':productId')
  @ZodSerializerDto(GetProductDetailResDTO)
  @ApiParam({ name: 'productId', required: true, type: Number })
  @ApiOperation({ summary: 'List detail product', description: 'Get product detail / Admin Only' })
  @ResponseMessage('Product fetched successfully')
  findById(@Param() params: GetProductParamsDTO, @ActiveUser() user: IAccessTokenPayload) {
    return this.manageProductService.getDetail({
      productId: params.productId,
      roleNameRequest: user.roleName,
      userIdRequest: user.userId,
    })
  }

  @Post()
  @ZodSerializerDto(GetProductDetailResDTO)
  @ResponseMessage('Product created successfully')
  @ApiBody({ type: CreateProductBodyDTO })
  @ApiOperation({ summary: 'Create new product', description: 'Create new product / Admin Only' })
  create(@Body() body: CreateProductBodyDTO, @ActiveUser('userId') userId: number) {
    return this.manageProductService.create({
      data: body,
      createdById: userId,
    })
  }

  @Put(':productId')
  @ZodSerializerDto(ProductDTO)
  @ResponseMessage('Product updated successfully')
  @ApiBody({ type: UpdateProductBodyDTO })
  @ApiOperation({ summary: 'Update product', description: 'Update product / Admin Only' })
  update(
    @Body() body: UpdateProductBodyDTO,
    @Param() params: GetProductParamsDTO,
    @ActiveUser() user: IAccessTokenPayload,
  ) {
    return this.manageProductService.update({
      data: body,
      productId: params.productId,
      updatedById: user.userId,
      roleNameRequest: user.roleName,
    })
  }

  @Delete(':productId')
  @ZodSerializerDto(MessageResDTO)
  @ResponseMessage('Product deleted successfully')
  @ApiParam({ name: 'productId', required: true, type: Number })
  @ApiOperation({ summary: 'Delete product', description: 'Delete product / Admin Only' })
  delete(@Param() params: GetProductParamsDTO, @ActiveUser() user: IAccessTokenPayload) {
    return this.manageProductService.delete({
      productId: params.productId,
      deletedById: user.userId,
      roleNameRequest: user.roleName,
    })
  }
}
