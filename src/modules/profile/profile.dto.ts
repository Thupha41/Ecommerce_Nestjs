import { createZodDto } from 'nestjs-zod'

import { ChangePasswordBodySchema, UpdateMeBodySchema } from './models/profile.model'

export class UpdateMeBodyDTO extends createZodDto(UpdateMeBodySchema) {}

export class ChangePasswordBodyDTO extends createZodDto(ChangePasswordBodySchema) {}
