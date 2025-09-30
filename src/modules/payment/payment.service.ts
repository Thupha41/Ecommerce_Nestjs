import { Injectable } from '@nestjs/common'
import { PaymentRepo } from './payment.repo'
import { WebhookPaymentBodyType } from './payment.model'

@Injectable()
export class PaymentService {
  constructor(private readonly paymentRepo: PaymentRepo) {}

  receiver(body: WebhookPaymentBodyType): Promise<number> {
    return this.paymentRepo.receiver(body)
  }
}
