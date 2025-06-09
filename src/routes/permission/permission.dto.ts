import { createZodDto } from 'nestjs-zod'
import {
  UpdatePermissionBodySchema,
  GetPermissionQuerySchema,
  GetPermissionParamsSchema,
  GetPermissionResSchema,
  GetPermissionDetailResSchema,
  CreatePermissionBodySchema,
} from './models/permission.model'

export class CreatePermissionBodyDTO extends createZodDto(CreatePermissionBodySchema) {}
export class UpdatePermissionBodyDTO extends createZodDto(UpdatePermissionBodySchema) {}
export class GetPermissionQueryDTO extends createZodDto(GetPermissionQuerySchema) {}
export class GetPermissionParamsDTO extends createZodDto(GetPermissionParamsSchema) {}
export class GetPermissionResDTO extends createZodDto(GetPermissionResSchema) {}
export class GetPermissionDetailResDTO extends createZodDto(GetPermissionDetailResSchema) {}
