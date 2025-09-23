import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateBrandBodyDTO,
  GetBrandDetailResDTO,
  GetBrandParamsDTO,
  GetBrandsResDTO,
  UpdateBrandBodyDTO,
} from 'src/modules/brand/brand.dto'
import { BrandService } from 'src/modules/brand/brand.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { PaginationQueryDTO } from 'src/shared/dtos/request.dto'
import { MessageResDTO } from 'src/shared/dtos/response.dto'
import { ApiBearerAuth, ApiQuery, ApiTags, ApiParam, ApiBody } from '@nestjs/swagger'
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard'
import { UseGuards } from '@nestjs/common'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'
@Controller('brands')
@ApiTags('Brands')
@ApiBearerAuth()
@UseGuards(AccessTokenGuard)
export class BrandController {
  constructor(private readonly brandService: BrandService) {}

  @Get()
  @IsPublic()
  @ZodSerializerDto(GetBrandsResDTO)
  @ResponseMessage('Brands fetched successfully')
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'lang', required: false, type: String })
  list(@Query() query: PaginationQueryDTO) {
    return this.brandService.list(query)
  }

  @Get(':brandId')
  @IsPublic()
  @ZodSerializerDto(GetBrandDetailResDTO)
  @ResponseMessage('Brand fetched successfully')
  @ApiParam({ name: 'brandId', required: true, type: Number })
  findById(@Param() params: GetBrandParamsDTO) {
    return this.brandService.findById(params.brandId)
  }

  @Post()
  @ApiBody({ type: CreateBrandBodyDTO })
  @ZodSerializerDto(GetBrandDetailResDTO)
  @ResponseMessage('Brand created successfully')
  create(@Body() body: CreateBrandBodyDTO, @ActiveUser('userId') userId: number) {
    return this.brandService.create({
      data: body,
      createdById: userId,
    })
  }

  @Put(':brandId')
  @ApiParam({ name: 'brandId', required: true, type: Number })
  @ApiBody({ type: UpdateBrandBodyDTO })
  @ZodSerializerDto(GetBrandDetailResDTO)
  @ResponseMessage('Brand updated successfully')
  update(@Body() body: UpdateBrandBodyDTO, @Param() params: GetBrandParamsDTO, @ActiveUser('userId') userId: number) {
    return this.brandService.update({
      data: body,
      id: params.brandId,
      updatedById: userId,
    })
  }

  @Delete(':brandId')
  @ApiParam({ name: 'brandId', required: true, type: Number })
  @ZodSerializerDto(MessageResDTO)
  @ResponseMessage('Brand deleted successfully')
  delete(@Param() params: GetBrandParamsDTO, @ActiveUser('userId') userId: number) {
    return this.brandService.delete({
      id: params.brandId,
      deletedById: userId,
    })
  }
}
