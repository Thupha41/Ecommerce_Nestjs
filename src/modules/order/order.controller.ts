import { Controller, Get, Param, Post, Put, Query } from '@nestjs/common'
import { Body } from '@nestjs/common'
import { OrderService } from './order.service'
import {
  CancelOrderBodyDTO,
  CancelOrderResDTO,
  CreateOrderBodyDTO,
  CreateOrderResDTO,
  GetOrderDetailResDTO,
  GetOrderListQueryDTO,
  GetOrderListResDTO,
  GetOrderParamsDTO,
} from './order.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ApiBearerAuth, ApiQuery, ApiParam, ApiBody, ApiOperation } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'
import { SkipThrottle } from '@nestjs/throttler'

@ApiBearerAuth()
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Get()
  @SkipThrottle()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiOperation({ summary: 'Get order list' })
  @ZodSerializerDto(GetOrderListResDTO)
  @ResponseMessage('Order list fetched successfully')
  list(@Query() query: GetOrderListQueryDTO, @ActiveUser('userId') userId: number) {
    return this.orderService.list(userId, query)
  }

  @Get(':orderId')
  @SkipThrottle()
  @ApiParam({ name: 'orderId', required: true, type: Number })
  @ApiOperation({ summary: 'Get order detail' })
  @ZodSerializerDto(GetOrderDetailResDTO)
  @ResponseMessage('Order detail fetched successfully')
  detail(@Param() params: GetOrderParamsDTO, @ActiveUser('userId') userId: number) {
    return this.orderService.detail(userId, params.orderId)
  }

  @Put(':orderId')
  @ApiParam({ name: 'orderId', required: true, type: Number })
  @ApiBody({ type: CancelOrderBodyDTO })
  @ResponseMessage('Order canceled successfully')
  @ApiOperation({ summary: 'Cancel order' })
  @ZodSerializerDto(CancelOrderResDTO)
  cancel(@Param() params: GetOrderParamsDTO, @ActiveUser('userId') userId: number, @Body() _: CancelOrderBodyDTO) {
    return this.orderService.cancel(userId, params.orderId)
  }

  @Post()
  @SkipThrottle()
  @ApiBody({ type: CreateOrderBodyDTO })
  @ResponseMessage('Order created successfully')
  @ApiOperation({ summary: 'Create order' })
  @ZodSerializerDto(CreateOrderResDTO)
  create(@ActiveUser('userId') userId: number, @Body() body: CreateOrderBodyDTO) {
    return this.orderService.create(userId, body)
  }
}
