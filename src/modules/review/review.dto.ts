import {
  CreateReviewBodySchema,
  CreateReviewResSchema,
  GetReviewDetailParamsSchema,
  GetReviewParamsSchema,
  GetReviewsSchema,
  UpdateReviewBodySchema,
  UpdateReviewResSchema,
} from './review.model'
import { createZodDto } from 'nestjs-zod'
import { createResponseDTO } from 'src/shared/dtos/response.dto'

export class CreateReviewBodyDTO extends createZodDto(CreateReviewBodySchema) {}
export class CreateReviewResDTO extends createResponseDTO(CreateReviewResSchema) {}
export class UpdateReviewBodyDTO extends createZodDto(UpdateReviewBodySchema) {}
export class UpdateReviewResDTO extends createResponseDTO(UpdateReviewResSchema) {}
export class GetReviewParamsDTO extends createZodDto(GetReviewParamsSchema) {}
export class GetReviewDetailParamsDTO extends createZodDto(GetReviewDetailParamsSchema) {}
export class GetReviewsDTO extends createResponseDTO(GetReviewsSchema) {}
