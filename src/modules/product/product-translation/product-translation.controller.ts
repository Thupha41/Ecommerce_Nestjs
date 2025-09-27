import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateProductTranslationBodyDTO,
  GetProductTranslationDetailResDTO,
  GetProductTranslationParamsDTO,
  UpdateProductTranslationBodyDTO,
} from 'src/modules/product/product-translation/product-translation.dto'
import { ProductTranslationService } from 'src/modules/product/product-translation/product-translation.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { ApiBearerAuth, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'

@ApiBearerAuth()
@ApiTags('Product Translations')
@Controller('product-translations')
export class ProductTranslationController {
  constructor(private readonly productTranslationService: ProductTranslationService) {}

  @Get(':productTranslationId')
  @ZodSerializerDto(GetProductTranslationDetailResDTO)
  @ApiParam({ name: 'productTranslationId', required: true, type: Number })
  @ResponseMessage('Product translation found successfully')
  findById(@Param() params: GetProductTranslationParamsDTO) {
    return this.productTranslationService.findById(params.productTranslationId)
  }

  @Post()
  @ZodSerializerDto(GetProductTranslationDetailResDTO)
  @ResponseMessage('Product translation created successfully')
  @ApiBody({ type: CreateProductTranslationBodyDTO })
  create(@Body() body: CreateProductTranslationBodyDTO, @ActiveUser('userId') userId: number) {
    return this.productTranslationService.create({
      data: body,
      createdById: userId,
    })
  }

  @Put(':productTranslationId')
  @ZodSerializerDto(GetProductTranslationDetailResDTO)
  @ResponseMessage('Product translation updated successfully')
  @ApiBody({ type: UpdateProductTranslationBodyDTO })
  @ApiParam({ name: 'productTranslationId', required: true, type: Number })
  update(
    @Body() body: UpdateProductTranslationBodyDTO,
    @Param() params: GetProductTranslationParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.productTranslationService.update({
      data: body,
      id: params.productTranslationId,
      updatedById: userId,
    })
  }

  @Delete(':productTranslationId')
  @ZodSerializerDto(MessageResDTO)
  @ResponseMessage('Product translation deleted successfully')
  @ApiParam({ name: 'productTranslationId', required: true, type: Number })
  delete(@Param() params: GetProductTranslationParamsDTO, @ActiveUser('userId') userId: number) {
    return this.productTranslationService.delete({
      id: params.productTranslationId,
      deletedById: userId,
    })
  }
}
