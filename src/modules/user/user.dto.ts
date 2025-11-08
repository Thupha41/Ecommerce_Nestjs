import { createZodDto } from 'nestjs-zod'
import {
  CreateUserBodySchema,
  GetUserParamsSchema,
  GetUsersQuerySchema,
  GetUsersResSchema,
  UpdateUserBodySchema,
} from 'src/modules/user/models/user.model'
import { UpdateProfileResDTO } from 'src/shared/dtos/shared-user.dto'
import { createResponseDTO } from 'src/shared/dtos/response.dto'

export class GetUsersResDTO extends createResponseDTO(GetUsersResSchema) {}

export class GetUsersQueryDTO extends createZodDto(GetUsersQuerySchema) {}

export class GetUserParamsDTO extends createZodDto(GetUserParamsSchema) {}

export class CreateUserBodyDTO extends createZodDto(CreateUserBodySchema) {}

export class UpdateUserBodyDTO extends createZodDto(UpdateUserBodySchema) {}

export class CreateUserResDTO extends UpdateProfileResDTO {}
