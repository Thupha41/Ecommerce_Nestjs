import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateBrandTranslationBodyDTO,
  GetBrandTranslationDetailResDTO,
  GetBrandTranslationParamsDTO,
  UpdateBrandTranslationBodyDTO,
} from 'src/modules/brand/brand-translation/brand-translation.dto'
import { BrandTranslationService } from 'src/modules/brand/brand-translation/brand-translation.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { ApiBearerAuth, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'

@Controller('brand-translations')
@ApiTags('Brand Translations')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class BrandTranslationController {
  constructor(private readonly brandTranslationService: BrandTranslationService) {}

  @Get(':brandTranslationId')
  @ZodSerializerDto(GetBrandTranslationDetailResDTO)
  @ResponseMessage('Brand Translation fetched successfully')
  @ApiParam({ name: 'brandTranslationId', required: true, type: Number })
  findById(@Param() params: GetBrandTranslationParamsDTO) {
    return this.brandTranslationService.findById(params.brandTranslationId)
  }

  @Post()
  @ZodSerializerDto(GetBrandTranslationDetailResDTO)
  @ResponseMessage('Brand Translation created successfully')
  @ApiBody({ type: CreateBrandTranslationBodyDTO })
  create(@Body() body: CreateBrandTranslationBodyDTO, @ActiveUser('userId') userId: number) {
    return this.brandTranslationService.create({
      data: body,
      createdById: userId,
    })
  }

  @Put(':brandTranslationId')
  @ApiParam({ name: 'brandTranslationId', required: true, type: Number })
  @ApiBody({ type: UpdateBrandTranslationBodyDTO })
  @ZodSerializerDto(GetBrandTranslationDetailResDTO)
  @ResponseMessage('Brand Translation updated successfully')
  update(
    @Body() body: UpdateBrandTranslationBodyDTO,
    @Param() params: GetBrandTranslationParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.brandTranslationService.update({
      data: body,
      id: params.brandTranslationId,
      updatedById: userId,
    })
  }

  @Delete(':brandTranslationId')
  @ApiParam({ name: 'brandTranslationId', required: true, type: Number })
  @ZodSerializerDto(MessageResDTO)
  @ResponseMessage('Brand Translation deleted successfully')
  delete(@Param() params: GetBrandTranslationParamsDTO, @ActiveUser('userId') userId: number) {
    return this.brandTranslationService.delete({
      id: params.brandTranslationId,
      deletedById: userId,
    })
  }
}
