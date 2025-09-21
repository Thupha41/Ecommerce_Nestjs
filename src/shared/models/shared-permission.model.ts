import { z } from 'zod'
import { HTTPMethod } from '../constants/permission.constants'

export const PermissionSchema = z.object({
  id: z.number(),
  name: z
    .string()
    .min(1, { message: 'Error.InvalidPermissionName' })
    .max(100, { message: 'Error.InvalidPermissionName' }),
  description: z.string(),
  path: z
    .string()
    .min(1, { message: 'Error.InvalidPermissionPath' })
    .max(255, { message: 'Error.InvalidPermissionPath' }),
  module: z.string().max(500),
  method: z.enum([
    HTTPMethod.GET,
    HTTPMethod.POST,
    HTTPMethod.PUT,
    HTTPMethod.DELETE,
    HTTPMethod.PATCH,
    HTTPMethod.OPTIONS,
    HTTPMethod.HEAD,
  ]),
  createdById: z.number().nullable(),
  createdAt: z.date(),
  updatedById: z.number().nullable(),
  deletedById: z.number().nullable(),
  updatedAt: z.date(),
  deletedAt: z.date().nullable(),
})

export type PermissionType = z.infer<typeof PermissionSchema>
