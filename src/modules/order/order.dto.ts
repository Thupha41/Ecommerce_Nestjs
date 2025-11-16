import { createZodDto } from 'nestjs-zod'
import {
  CancelOrderBodySchema,
  CancelOrderResSchema,
  CreateOrderBodySchema,
  CreateOrderResSchema,
  GetOrderDetailResSchema,
  GetOrderListQuerySchema,
  GetOrderListResSchema,
  GetManageOrderListQuerySchema,
  GetOrderParamsSchema,
} from 'src/modules/order/models/order.model'
import { createResponseDTO } from 'src/shared/dtos/response.dto'

export class GetOrderListResDTO extends createResponseDTO(GetOrderListResSchema) {}

export class GetOrderListQueryDTO extends createZodDto(GetOrderListQuerySchema) {}

export class GetManageOrderListQueryDTO extends createZodDto(GetManageOrderListQuerySchema) {}

export class GetOrderDetailResDTO extends createResponseDTO(GetOrderDetailResSchema) {}

export class CreateOrderBodyDTO extends createZodDto(CreateOrderBodySchema) {}

export class CancelOrderBodyDTO extends createZodDto(CancelOrderBodySchema) {}

export class CreateOrderResDTO extends createResponseDTO(CreateOrderResSchema) {}

export class CancelOrderResDTO extends createZodDto(CancelOrderResSchema) {}

export class GetOrderParamsDTO extends createZodDto(GetOrderParamsSchema) {}
