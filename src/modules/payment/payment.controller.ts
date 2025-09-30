import { PaymentService } from './payment.service'
import { WebhookPaymentBodyDTO } from './payment.dto'
import { ApiBody, ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { Body, Controller, Post } from '@nestjs/common'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import { IsPublic } from 'src/shared/decorators/auth.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@Controller('payment')
// @ApiBearerAuth()
@ApiTags('Payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('receiver')
  @ApiBody({ type: WebhookPaymentBodyDTO })
  @ApiOperation({ summary: 'Webhook payment' })
  @IsPublic()
  @ZodSerializerDto(MessageResDTO)
  @ResponseMessage('Payment received successfully')
  receiver(@Body() body: WebhookPaymentBodyDTO) {
    return this.paymentService.receiver(body)
  }
}
