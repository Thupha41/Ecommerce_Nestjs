import { createZodDto } from 'nestjs-zod'
import { z } from 'zod'
import {
  ApiResponseSchema,
  MessageResSchema,
  MessageResponseSchema,
  createApiResponseSchema,
  createArrayResponseSchema,
} from '../models/response.model'

export class MessageResDTO extends createZodDto(MessageResSchema) {}
export class ApiResponseDTO extends createZodDto(ApiResponseSchema) {}
export class MessageResponseDTO extends createZodDto(MessageResponseSchema) {}

// Helper function để tạo response DTO từ schema
export function createResponseDTO<T extends z.ZodType<any, any, any>>(schema: T) {
  return createZodDto(createApiResponseSchema(schema))
}

// Helper function để tạo array response DTO từ schema
export function createArrayResponseDTO<T extends z.ZodType<any, any, any>>(schema: T) {
  return createZodDto(createArrayResponseSchema(schema))
}
