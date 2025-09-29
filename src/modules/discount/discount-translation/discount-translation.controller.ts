import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common'
import { ApiBearerAuth, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateDiscountTranslationBodyDTO,
  GetDiscountTranslationDetailResDTO,
  GetDiscountTranslationParamsDTO,
  UpdateDiscountTranslationBodyDTO,
} from 'src/modules/discount/discount-translation/discount-translation.dto'
import { DiscountTranslationService } from 'src/modules/discount/discount-translation/discount-translation.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'

@Controller('discount-translations')
@ApiTags('Discount Translations')
@ApiBearerAuth()
export class DiscountTranslationController {
  constructor(private readonly discountTranslationService: DiscountTranslationService) {}

  @Get(':discountTranslationId')
  @ZodSerializerDto(GetDiscountTranslationDetailResDTO)
  @ResponseMessage('Discount Translation fetched successfully')
  @ApiParam({ name: 'discountTranslationId', required: true, type: Number })
  findById(@Param() params: GetDiscountTranslationParamsDTO) {
    return this.discountTranslationService.findById(params.discountTranslationId)
  }

  @Post()
  @ZodSerializerDto(GetDiscountTranslationDetailResDTO)
  @ResponseMessage('Discount Translation created successfully')
  @ApiBody({ type: CreateDiscountTranslationBodyDTO })
  create(@Body() body: CreateDiscountTranslationBodyDTO, @ActiveUser('userId') userId: number) {
    return this.discountTranslationService.create({
      data: body,
      createdById: userId,
    })
  }

  @Put(':discountTranslationId')
  @ZodSerializerDto(GetDiscountTranslationDetailResDTO)
  @ResponseMessage('Discount Translation updated successfully')
  @ApiParam({ name: 'discountTranslationId', required: true, type: Number })
  @ApiBody({ type: UpdateDiscountTranslationBodyDTO })
  update(
    @Body() body: UpdateDiscountTranslationBodyDTO,
    @Param() params: GetDiscountTranslationParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.discountTranslationService.update({
      data: body,
      id: params.discountTranslationId,
      updatedById: userId,
    })
  }

  @Delete(':discountTranslationId')
  @ZodSerializerDto(MessageResDTO)
  @ResponseMessage('Discount Translation deleted successfully')
  @ApiParam({ name: 'discountTranslationId', required: true, type: Number })
  delete(@Param() params: GetDiscountTranslationParamsDTO, @ActiveUser('userId') userId: number) {
    return this.discountTranslationService.delete({
      id: params.discountTranslationId,
      deletedById: userId,
    })
  }
}
