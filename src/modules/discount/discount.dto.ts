import { createZodDto } from 'nestjs-zod'
import { createResponseDTO } from 'src/shared/dtos/response.dto'
import {
  CreateDiscountBodySchema,
  GetAllDiscountsResSchema,
  GetDiscountDetailResSchema,
  GetDiscountParamsSchema,
  GetDiscountsQuerySchema,
  UpdateDiscountBodySchema,
} from './models/discount.model'

export class CreateDiscountBodyDTO extends createZodDto(CreateDiscountBodySchema) {}
export class DiscountResDTO extends createResponseDTO(GetDiscountDetailResSchema) {}
export class GetDiscountParamDTO extends createZodDto(GetDiscountParamsSchema) {}
export class UpdateDiscountBodyDTO extends createZodDto(UpdateDiscountBodySchema) {}
export class GetDiscountsQueryDTO extends createZodDto(GetDiscountsQuerySchema) {}
export class GetAllDiscountsResDTO extends createResponseDTO(GetAllDiscountsResSchema) {}
