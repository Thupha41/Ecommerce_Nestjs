import { Injectable } from '@nestjs/common'
import { OrderRepo } from './order.repo'
import {
  GetOrderListQueryType,
  GetOrderListResType,
  GetOrderDetailResType,
  CancelOrderResType,
  CreateOrderBodyType,
} from './models/order.model'
import { OrderProducer } from 'src/modules/order/order.producer'

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepo: OrderRepo,
    private readonly orderProducer: OrderProducer,
  ) {}

  list(userId: number, query: GetOrderListQueryType): Promise<GetOrderListResType> {
    return this.orderRepo.list(userId, query)
  }

  detail(userId: number, orderId: number): Promise<GetOrderDetailResType> {
    return this.orderRepo.detail(userId, orderId)
  }

  cancel(userId: number, orderId: number): Promise<CancelOrderResType> {
    return this.orderRepo.cancel(userId, orderId)
  }

  async create(userId: number, body: CreateOrderBodyType) {
    const result = await this.orderRepo.create(userId, body)
    await this.orderProducer.addCancelPaymentJob(result.paymentId)
    return result
  }
}
