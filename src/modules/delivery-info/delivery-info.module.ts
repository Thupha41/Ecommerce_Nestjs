import { Module } from '@nestjs/common'
import { DeliveryInfoController } from './delivery-info.controller'
import { DeliveryInfoService } from './delivery-info.service'
import { DeliveryInfoRepository } from './delivery-info.repo'

@Module({
  providers: [DeliveryInfoService, DeliveryInfoRepository],
  controllers: [DeliveryInfoController],
})
export class DeliveryInfoModule {}
