import { z } from 'zod'

export const DeliveryInfoSchema = z.object({
  id: z.number(),
  name: z.string(),
  phone: z.string().min(9).max(15),
  provinceCity: z.string(),
  district: z.string(),
  ward: z.string(),
  street: z.string(),
  isDefault: z.boolean(),
  userId: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
})

export const GetDeliveryInfoParamsSchema = z
  .object({
    deliveryInfoId: z.coerce.number().int().positive(),
  })
  .strict()

export const GetDeliveryResSchema = z.object({
  items: z.array(DeliveryInfoSchema),
})

export const CreateDeliveryInfoBodySchema = DeliveryInfoSchema.pick({
  name: true,
  phone: true,
  provinceCity: true,
  district: true,
  ward: true,
  street: true,
  isDefault: true,
})

export const UpdateDeliveryInfoBodySchema = CreateDeliveryInfoBodySchema

export type DeliveryInfoType = z.infer<typeof DeliveryInfoSchema>
export type GetDeliveryInfoParamType = z.infer<typeof GetDeliveryInfoParamsSchema>
export type GetDeliveryResType = z.infer<typeof GetDeliveryResSchema>
export type CreateDeliveryInfoBodyType = z.infer<typeof CreateDeliveryInfoBodySchema>
export type UpdateDeliveryInfoBodyType = z.infer<typeof UpdateDeliveryInfoBodySchema>
