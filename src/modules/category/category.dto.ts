import { createZodDto } from 'nestjs-zod'
import {
  CreateCategoryBodySchema,
  GetCategoryDetailResSchema,
  GetCategoryParamsSchema,
  GetAllCategoriesResSchema,
  UpdateCategoryBodySchema,
  GetAllCategoriesQuerySchema,
} from 'src/modules/category/category.model'
import { createResponseDTO } from 'src/shared/dtos/response.dto'

export class GetAllCategoriesResDTO extends createResponseDTO(GetAllCategoriesResSchema) {}

export class GetAllCategoriesQueryDTO extends createZodDto(GetAllCategoriesQuerySchema) {}

export class GetCategoryParamsDTO extends createZodDto(GetCategoryParamsSchema) {}

export class GetCategoryDetailResDTO extends createResponseDTO(GetCategoryDetailResSchema) {}

export class CreateCategoryBodyDTO extends createZodDto(CreateCategoryBodySchema) {}

export class UpdateCategoryBodyDTO extends createZodDto(UpdateCategoryBodySchema) {}
