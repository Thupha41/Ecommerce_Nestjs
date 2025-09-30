import { Injectable } from '@nestjs/common'
import { OrderRepo } from './order.repo'
import {
  GetOrderListQueryType,
  GetOrderListResType,
  GetOrderDetailResType,
  CancelOrderResType,
  CreateOrderBodyType,
} from './models/order.model'

@Injectable()
export class OrderService {
  constructor(private readonly orderRepo: OrderRepo) {}

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
    return result
  }
}
