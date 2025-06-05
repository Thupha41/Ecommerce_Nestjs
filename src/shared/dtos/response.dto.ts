import { MessageResSchema } from '../models/response.model'
import { createZodDto } from 'nestjs-zod'

export class MessageResDTO extends createZodDto(MessageResSchema) {}
