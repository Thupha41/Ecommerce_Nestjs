import { Injectable } from '@nestjs/common'
import { DeliveryInfoRepository } from './delivery-info.repo'
import {
  CreateDeliveryInfoBodyType,
  DeliveryInfoType,
  GetDeliveryResType,
  UpdateDeliveryInfoBodyType,
} from './models/delivery-info.model'

@Injectable()
export class DeliveryInfoService {
  constructor(private readonly deliveryInfoRepository: DeliveryInfoRepository) {}

  create(userId: number, data: CreateDeliveryInfoBodyType): Promise<DeliveryInfoType> {
    return this.deliveryInfoRepository.create(userId, data)
  }

  update({
    userId,
    data,
    deliveryInfoId,
  }: {
    userId: number
    data: UpdateDeliveryInfoBodyType
    deliveryInfoId: number
  }): Promise<DeliveryInfoType> {
    return this.deliveryInfoRepository.update({ userId, data, deliveryInfoId })
  }

  delete(userId: number, deliveryInfoId: number): Promise<DeliveryInfoType> {
    return this.deliveryInfoRepository.delete(userId, deliveryInfoId)
  }

  getAllDeliveryInfoByUserId(userId: number): Promise<GetDeliveryResType> {
    return this.deliveryInfoRepository.getAllDeliveryInfoByUserId(userId)
  }

  getDeliveryInfoById(deliveryInfoId: number, userId: number): Promise<DeliveryInfoType> {
    return this.deliveryInfoRepository.getDeliveryInfoById(deliveryInfoId, userId)
  }

  getDeliveryDefaultByUserId(userId: number): Promise<DeliveryInfoType> {
    return this.deliveryInfoRepository.getDeliveryDefaultByUserId(userId)
  }
}
