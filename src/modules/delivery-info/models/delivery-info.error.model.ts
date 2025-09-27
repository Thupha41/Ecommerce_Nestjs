import { NotFoundException } from '@nestjs/common'

export const DeliveryInfoNotFoundException = new NotFoundException('Error.DeliveryInfoNotFound')
