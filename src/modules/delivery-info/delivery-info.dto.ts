import { createZodDto } from 'nestjs-zod'
import {
  CreateDeliveryInfoBodySchema,
  UpdateDeliveryInfoBodySchema,
  DeliveryInfoSchema,
  GetDeliveryInfoParamsSchema,
  GetDeliveryResSchema,
} from './models/delivery-info.model'
import { createResponseDTO } from 'src/shared/dtos/response.dto'

export class DeliveryInfoDTO extends createResponseDTO(DeliveryInfoSchema) {}
export class CreateDeliveryInfoBodyDTO extends createZodDto(CreateDeliveryInfoBodySchema) {}
export class UpdateDeliveryInfoBodyDTO extends createZodDto(UpdateDeliveryInfoBodySchema) {}
export class GetDeliveryInfoParamsDTO extends createZodDto(GetDeliveryInfoParamsSchema) {}
export class GetDeliveryResDTO extends createResponseDTO(GetDeliveryResSchema) {}
