import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common'
import { ApiBearerAuth, ApiTags, ApiQuery, ApiParam, ApiBody } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateCategoryBodyDTO,
  GetCategoryDetailResDTO,
  GetCategoryParamsDTO,
  GetAllCategoriesResDTO,
  UpdateCategoryBodyDTO,
  GetAllCategoriesQueryDTO,
} from 'src/modules/category/category.dto'
import { CategoryService } from 'src/modules/category/category.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'

@Controller('categories')
@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetAllCategoriesResDTO)
  @ResponseMessage('Categories fetched successfully')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'lang', required: false, type: String })
  @ApiQuery({ name: 'parentCategoryId', required: false, type: Number })
  findAll(@Query() query: GetAllCategoriesQueryDTO) {
    return this.categoryService.findAll(query.parentCategoryId)
  }

  @Get(':categoryId')
  @IsPublic()
  @ZodSerializerDto(GetCategoryDetailResDTO)
  @ResponseMessage('Category fetched successfully')
  @ApiParam({ name: 'categoryId', required: true, type: Number })
  @ApiQuery({ name: 'lang', required: false, type: String })
  findById(@Param() params: GetCategoryParamsDTO) {
    return this.categoryService.findById(params.categoryId)
  }

  @Post()
  @ZodSerializerDto(GetCategoryDetailResDTO)
  @ResponseMessage('Category created successfully')
  @ApiBody({ type: CreateCategoryBodyDTO })
  create(@Body() body: CreateCategoryBodyDTO, @ActiveUser('userId') userId: number) {
    return this.categoryService.create({
      data: body,
      createdById: userId,
    })
  }

  @Put(':categoryId')
  @ZodSerializerDto(GetCategoryDetailResDTO)
  @ResponseMessage('Category updated successfully')
  @ApiParam({ name: 'categoryId', required: true, type: Number })
  @ApiBody({ type: UpdateCategoryBodyDTO })
  update(
    @Body() body: UpdateCategoryBodyDTO,
    @Param() params: GetCategoryParamsDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.categoryService.update({
      data: body,
      id: params.categoryId,
      updatedById: userId,
    })
  }

  @Delete(':categoryId')
  @ZodSerializerDto(MessageResDTO)
  @ResponseMessage('Category deleted successfully')
  @ApiParam({ name: 'categoryId', required: true, type: Number })
  delete(@Param() params: GetCategoryParamsDTO, @ActiveUser('userId') userId: number) {
    return this.categoryService.delete({
      id: params.categoryId,
      deletedById: userId,
    })
  }
}
