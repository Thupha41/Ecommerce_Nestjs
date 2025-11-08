import { createZodDto } from 'nestjs-zod'
import { GetLikesQuerySchema, GetLikesResSchema, CreateLikeBodySchema, LikeResSchema } from './models/like.model'
import { createResponseDTO } from 'src/shared/dtos/response.dto'

export class GetLikesQueryDTO extends createZodDto(GetLikesQuerySchema) {}

export class GetLikesResDTO extends createResponseDTO(GetLikesResSchema) {}

export class CreateLikeBodyDTO extends createZodDto(CreateLikeBodySchema) {}

export class LikeResDTO extends createResponseDTO(LikeResSchema) {}

