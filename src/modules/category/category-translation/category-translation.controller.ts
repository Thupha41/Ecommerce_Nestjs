import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateCategoryTranslationBodyDTO,
  GetCategoryTranslationDetailResDTO,
  GetCategoryTranslationParamsDTO,
  UpdateCategoryTranslationBodyDTO,
} from 'src/modules/category/category-translation/category-translation.dto'
import { CategoryTranslationService } from 'src/modules/category/category-translation/category-translation.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'

@Controller('category-translations')
@ApiTags('Category Translations')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class CategoryTranslationController {
  constructor(private readonly categoryTranslationService: CategoryTranslationService) {}

  @Get(':categoryTranslationId')
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  @ResponseMessage('Category Translation fetched successfully')
  @ApiParam({ name: 'categoryTranslationId', required: true, type: Number })
  findById(@Param() params: GetCategoryTranslationParamsDTO) {
    return this.categoryTranslationService.findById(params.categoryTranslationId)
  }

  @Post()
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  @ResponseMessage('Category Translation created successfully')
  @ApiBody({ type: CreateCategoryTranslationBodyDTO })
  create(@Body() body: CreateCategoryTranslationBodyDTO, @ActiveUser('userId') userId: number) {
    return this.categoryTranslationService.create({
      data: body,
      createdById: userId,
    })
  }

  @Put(':categoryTranslationId')
  @ZodSerializerDto(GetCategoryTranslationDetailResDTO)
  @ResponseMessage('Category Translation updated successfully')
  @ApiParam({ name: 'categoryTranslationId', required: true, type: Number })
  @ApiBody({ type: UpdateCategoryTranslationBodyDTO })
  update(
    @Body() body: UpdateCategoryTranslationBodyDTO,
    @Param() params: GetCategoryTranslationParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.categoryTranslationService.update({
      data: body,
      id: params.categoryTranslationId,
      updatedById: userId,
    })
  }

  @Delete(':categoryTranslationId')
  @ZodSerializerDto(MessageResDTO)
  @ResponseMessage('Category Translation deleted successfully')
  @ApiParam({ name: 'categoryTranslationId', required: true, type: Number })
  delete(@Param() params: GetCategoryTranslationParamsDTO, @ActiveUser('userId') userId: number) {
    return this.categoryTranslationService.delete({
      id: params.categoryTranslationId,
      deletedById: userId,
    })
  }
}
