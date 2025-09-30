import { Module } from '@nestjs/common'
import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'
import { PaymentRepo } from './payment.repo'
import { PaymentProducer } from './payment.producer'
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant'
import { BullModule } from '@nestjs/bullmq'

@Module({
  imports: [
    BullModule.registerQueue({
      name: PAYMENT_QUEUE_NAME,
    }),
  ],
  providers: [PaymentService, PaymentRepo, PaymentProducer],
  controllers: [PaymentController],
})
export class PaymentModule {}
