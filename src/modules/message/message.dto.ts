import { createZodDto } from 'nestjs-zod'
import { GetMessagesQuerySchema, GetMessagesResSchema, CreateMessageBodySchema, CreateMessageResSchema } from './models/message.model'
import { createResponseDTO } from 'src/shared/dtos/response.dto'

export class GetMessagesQueryDTO extends createZodDto(GetMessagesQuerySchema) {}

export class GetMessagesResDTO extends createResponseDTO(GetMessagesResSchema) {}

export class CreateMessageBodyDTO extends createZodDto(CreateMessageBodySchema) {}

export class CreateMessageResDTO extends createResponseDTO(CreateMessageResSchema) {}

