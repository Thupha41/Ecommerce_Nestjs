import { z } from 'zod'

// Schema cơ bản cho message
export const MessageResSchema = z.object({
  message: z.string(),
})

// Schema wrapper chung cho tất cả response
export const createApiResponseSchema = <T extends z.ZodType<any, any, any>>(dataSchema: T) =>
  z.object({
    data: dataSchema,
    statusCode: z.number(),
    message: z.string().optional(),
  })

// Schema cho response rỗng (chỉ có message)
export const ApiResponseSchema = createApiResponseSchema(z.any())

// Schema cho message response
export const MessageResponseSchema = createApiResponseSchema(MessageResSchema)

// Schema cho array response
export const createArrayResponseSchema = <T extends z.ZodType<any, any, any>>(itemSchema: T) =>
  createApiResponseSchema(z.array(itemSchema))

export type MessageType = z.infer<typeof MessageResSchema>
export type ApiResponseType<T extends z.ZodType<any, any, any>> = z.infer<ReturnType<typeof createApiResponseSchema<T>>>
