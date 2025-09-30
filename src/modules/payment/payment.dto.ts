import { createZodDto } from 'nestjs-zod'

import { WebhookPaymentBodySchema } from 'src/modules/payment/payment.model'

export class WebhookPaymentBodyDTO extends createZodDto(WebhookPaymentBodySchema) {}
