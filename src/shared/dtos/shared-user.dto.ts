import { GetUserProfileResSchema, UpdateProfileResSchema } from '../models/shared-user.model'
import { createResponseDTO } from './response.dto'

/**
 * Áp dụng cho Response của api GET('profile') và GET('users/:userId')
 */
export class GetUserProfileResDTO extends createResponseDTO(GetUserProfileResSchema) {}

/**
 * Áp dụng cho Response của api PUT('profile') và PUT('users/:userId')
 */
export class UpdateProfileResDTO extends createResponseDTO(UpdateProfileResSchema) {}
