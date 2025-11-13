import { z } from 'zod'
import { PermissionSchema } from 'src/shared/models/shared-permission.model'
import { HTTPMethod } from 'src/shared/constants/permission.constants'

export const CreatePermissionBodySchema = PermissionSchema.pick({
  name: true,
  path: true,
  method: true,
  module: true,
}).strict()

export const GetPermissionQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    module: z.string().optional(),
    method: z.enum([
      HTTPMethod.GET,
      HTTPMethod.POST,
      HTTPMethod.PUT,
      HTTPMethod.DELETE,
      HTTPMethod.PATCH,
      HTTPMethod.OPTIONS,
      HTTPMethod.HEAD,
    ]).optional(),
  })
  .strict()

export const GetPermissionParamsSchema = z
  .object({
    permissionId: z.coerce.number(),
  })
  .strict()

export const GetPermissionResSchema = z.object({
  items: z.array(PermissionSchema),
  totalItems: z.number(),
  page: z.number(),
  limit: z.number(),
  totalPages: z.number(),
})
export const UpdatePermissionBodySchema = CreatePermissionBodySchema
export type PermissionType = z.infer<typeof PermissionSchema>
export const GetPermissionDetailResSchema = PermissionSchema
export type CreatePermissionBodyType = z.infer<typeof CreatePermissionBodySchema>
export type UpdatePermissionBodyType = z.infer<typeof UpdatePermissionBodySchema>
export type GetPermissionsQueryType = z.infer<typeof GetPermissionQuerySchema>
export type GetPermissionParamsType = z.infer<typeof GetPermissionParamsSchema>
export type GetPermissionsResType = z.infer<typeof GetPermissionResSchema>
