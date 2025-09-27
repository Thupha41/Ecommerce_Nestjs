import { Controller, Post, Body, Put, Param, Delete, Get } from '@nestjs/common'
import { DeliveryInfoService } from './delivery-info.service'
import { ApiBearerAuth, ApiParam, ApiTags, ApiBody } from '@nestjs/swagger'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  DeliveryInfoDTO,
  CreateDeliveryInfoBodyDTO,
  UpdateDeliveryInfoBodyDTO,
  GetDeliveryInfoParamsDTO,
  GetDeliveryResDTO,
} from './delivery-info.dto'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('delivery-info')
@ApiBearerAuth()
@ApiTags('Delivery Info')
export class DeliveryInfoController {
  constructor(private readonly deliveryInfoService: DeliveryInfoService) {}

  @Get('default')
  @ZodSerializerDto(DeliveryInfoDTO)
  @ResponseMessage('Delivery Info fetched successfully')
  getDeliveryDefaultByUserId(@ActiveUser('userId') userId: number) {
    return this.deliveryInfoService.getDeliveryDefaultByUserId(userId)
  }

  @Get()
  @ZodSerializerDto(GetDeliveryResDTO)
  @ResponseMessage('Delivery Info fetched successfully')
  getAll(@ActiveUser('userId') userId: number) {
    return this.deliveryInfoService.getAllDeliveryInfoByUserId(userId)
  }

  @Post()
  @ZodSerializerDto(DeliveryInfoDTO)
  @ResponseMessage('Delivery Info created successfully')
  @ApiBody({ type: CreateDeliveryInfoBodyDTO })
  create(@ActiveUser('userId') userId: number, @Body() body: CreateDeliveryInfoBodyDTO) {
    return this.deliveryInfoService.create(userId, body)
  }

  @Put(':deliveryInfoId')
  @ZodSerializerDto(DeliveryInfoDTO)
  @ResponseMessage('Delivery Info updated successfully')
  @ApiParam({ name: 'deliveryInfoId', required: true, type: Number })
  @ApiBody({ type: UpdateDeliveryInfoBodyDTO })
  update(
    @ActiveUser('userId') userId: number,
    @Body() body: UpdateDeliveryInfoBodyDTO,
    @Param() params: GetDeliveryInfoParamsDTO,
  ) {
    return this.deliveryInfoService.update({
      userId,
      data: body,
      deliveryInfoId: params.deliveryInfoId,
    })
  }

  @Delete(':deliveryInfoId')
  @ZodSerializerDto(MessageResDTO)
  @ResponseMessage('Delivery Info deleted successfully')
  @ApiParam({ name: 'deliveryInfoId', required: true, type: Number })
  delete(@ActiveUser('userId') userId: number, @Param() params: GetDeliveryInfoParamsDTO) {
    return this.deliveryInfoService.delete(userId, params.deliveryInfoId)
  }

  @Get(':deliveryInfoId')
  @ApiParam({ name: 'deliveryInfoId', required: true, type: Number })
  @ZodSerializerDto(DeliveryInfoDTO)
  @ResponseMessage('Delivery Info fetched successfully')
  getDeliveryInfoById(@ActiveUser('userId') userId: number, @Param() params: GetDeliveryInfoParamsDTO) {
    return this.deliveryInfoService.getDeliveryInfoById(params.deliveryInfoId, userId)
  }
}
