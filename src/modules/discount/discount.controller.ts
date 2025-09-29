import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common'
import { DiscountService } from './discount.service'
import { ApiBearerAuth, ApiParam, ApiTags, ApiBody, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  CreateDiscountBodyDTO,
  DiscountResDTO,
  GetAllDiscountsResDTO,
  GetDiscountParamDTO,
  GetDiscountsQueryDTO,
  UpdateDiscountBodyDTO,
} from './discount.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('discounts')
@ApiBearerAuth()
@ApiTags('Discounts')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Get()
  @ZodSerializerDto(GetAllDiscountsResDTO)
  @ResponseMessage('Discounts retrieved successfully')
  @ApiOperation({ summary: 'Get all discounts with filtering and pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'type', required: false, enum: ['PERCENTAGE', 'FIXED'] })
  @ApiQuery({ name: 'code', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  @ApiQuery({ name: 'applyTo', required: false, enum: ['ALL', 'SPECIFIC'] })
  @ApiQuery({ name: 'startDateFrom', required: false, type: Date })
  @ApiQuery({ name: 'startDateTo', required: false, type: Date })
  @ApiQuery({ name: 'endDateFrom', required: false, type: Date })
  @ApiQuery({ name: 'endDateTo', required: false, type: Date })
  @ApiQuery({ name: 'orderBy', required: false, enum: ['asc', 'desc'] })
  @ApiQuery({
    name: 'sortBy',
    required: false,
    enum: ['createdAt', 'minQuantity', 'minOrderValue', 'maxUses', 'maxUsesPerUser', 'startDate', 'endDate', 'value'],
  })
  list(@Query() query: GetDiscountsQueryDTO) {
    return this.discountService.list(query)
  }

  @Post()
  @ZodSerializerDto(DiscountResDTO)
  @ResponseMessage('Discount created successfully')
  @ApiBody({ type: CreateDiscountBodyDTO })
  create(@Body() body: CreateDiscountBodyDTO, @ActiveUser('userId') userId: number) {
    return this.discountService.create(body, userId)
  }

  @Delete(':discountId')
  @ZodSerializerDto(MessageResDTO)
  @ApiParam({ name: 'discountId', required: true, type: Number })
  @ResponseMessage('Discount deleted successfully')
  delete(@Param() params: GetDiscountParamDTO, @ActiveUser('userId') userId: number) {
    return this.discountService.delete({ id: params.discountId, deletedById: userId }, false)
  }

  @Put(':discountId')
  @ZodSerializerDto(DiscountResDTO)
  @ResponseMessage('Discount updated successfully')
  @ApiParam({ name: 'discountId', required: true, type: Number })
  @ApiBody({ type: UpdateDiscountBodyDTO })
  update(
    @Param() params: GetDiscountParamDTO,
    @Body() body: UpdateDiscountBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.discountService.update(params.discountId, body, userId)
  }
}
