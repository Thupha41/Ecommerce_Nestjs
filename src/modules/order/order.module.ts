import { Module } from '@nestjs/common'
import { OrderController } from './order.controller'
import { OrderService } from './order.service'
import { OrderRepo } from './order.repo'

@Module({
  providers: [OrderService, OrderRepo],
  controllers: [OrderController],
})
export class OrderModule {}
