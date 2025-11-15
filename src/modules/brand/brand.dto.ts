import { createZodDto } from 'nestjs-zod'
import {
  CreateBrandBodySchema,
  GetBrandDetailResSchema,
  GetBrandParamsSchema,
  GetBrandsResSchema,
  GetBrandsQuerySchema,
  UpdateBrandBodySchema,
} from 'src/modules/brand/models/brand.model'
import { createResponseDTO } from 'src/shared/dtos/response.dto'

export class GetBrandsResDTO extends createResponseDTO(GetBrandsResSchema) {}

export class GetBrandsQueryDTO extends createZodDto(GetBrandsQuerySchema) {}

export class GetBrandParamsDTO extends createZodDto(GetBrandParamsSchema) {}

export class GetBrandDetailResDTO extends createResponseDTO(GetBrandDetailResSchema) {}

export class CreateBrandBodyDTO extends createZodDto(CreateBrandBodySchema) {}

export class UpdateBrandBodyDTO extends createZodDto(UpdateBrandBodySchema) {}
