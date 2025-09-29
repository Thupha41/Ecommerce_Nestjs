import { createZodDto } from 'nestjs-zod'
import {
  CreateDiscountTranslationBodySchema,
  GetDiscountTranslationDetailResSchema,
  GetDiscountTranslationParamsSchema,
  UpdateDiscountTranslationBodySchema,
} from 'src/modules/discount/models/discount-translation.model'
import { createResponseDTO } from 'src/shared/dtos/response.dto'

export class GetDiscountTranslationDetailResDTO extends createResponseDTO(GetDiscountTranslationDetailResSchema) {}
export class GetDiscountTranslationParamsDTO extends createZodDto(GetDiscountTranslationParamsSchema) {}

export class CreateDiscountTranslationBodyDTO extends createZodDto(CreateDiscountTranslationBodySchema) {}

export class UpdateDiscountTranslationBodyDTO extends createZodDto(UpdateDiscountTranslationBodySchema) {}
