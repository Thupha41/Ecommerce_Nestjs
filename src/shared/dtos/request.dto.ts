import { EmptyBodySchema } from '../models/request.model'
import { createZodDto } from 'nestjs-zod'

export class EmptyBodyDTO extends createZodDto(EmptyBodySchema) {}
