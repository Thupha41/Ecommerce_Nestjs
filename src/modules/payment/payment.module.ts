import { Module } from '@nestjs/common'
import { PaymentController } from './payment.controller'
import { PaymentService } from './payment.service'
import { PaymentRepo } from './payment.repo'

@Module({
  providers: [PaymentService, PaymentRepo],
  controllers: [PaymentController],
})
export class PaymentModule {}
