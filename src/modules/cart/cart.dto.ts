import { createZodDto } from 'nestjs-zod'
import {
  CartItemDetailSchema,
  AddToCartBodySchema,
  GetCartResSchema,
  GetCartItemParamsSchema,
  UpdateCartItemBodySchema,
} from 'src/modules/cart/models/cart.model'
import { createResponseDTO } from 'src/shared/dtos/response.dto'

export class GetCartItemParamDto extends createZodDto(GetCartItemParamsSchema) {}

export class CartItemDetailDto extends createResponseDTO(CartItemDetailSchema) {}

export class GetCartResDto extends createResponseDTO(GetCartResSchema) {}

export class AddToCartBodyDto extends createZodDto(AddToCartBodySchema) {}

export class UpdateCartItemBodyDto extends createZodDto(UpdateCartItemBodySchema) {}
