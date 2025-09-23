import { createZodDto } from 'nestjs-zod'
import {
  CreateBrandTranslationBodySchema,
  GetBrandTranslationDetailResSchema,
  GetBrandTranslationParamsSchema,
  UpdateBrandTranslationBodySchema,
} from 'src/modules/brand/brand-translation/models/brand-translation.model'
import { createResponseDTO } from 'src/shared/dtos/response.dto'

export class GetBrandTranslationDetailResDTO extends createResponseDTO(GetBrandTranslationDetailResSchema) {}
export class GetBrandTranslationParamsDTO extends createZodDto(GetBrandTranslationParamsSchema) {}

export class CreateBrandTranslationBodyDTO extends createZodDto(CreateBrandTranslationBodySchema) {}

export class UpdateBrandTranslationBodyDTO extends createZodDto(UpdateBrandTranslationBodySchema) {}
