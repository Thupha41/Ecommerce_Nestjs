import { Module } from '@nestjs/common'
import { OrderController } from './order.controller'
import { ManageOrderController } from './manage-order.controller'
import { OrderService } from './order.service'
import { ManageOrderService } from './manage-order.service'
import { OrderRepo } from './order.repo'
import { BullModule } from '@nestjs/bullmq'
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { OrderProducer } from './order.producer'

@Module({
  imports: [
    BullModule.registerQueue({
      name: PAYMENT_QUEUE_NAME,
    }),
  ],
  providers: [OrderService, ManageOrderService, OrderRepo, OrderProducer],
  controllers: [OrderController, ManageOrderController],
})
export class OrderModule {}
