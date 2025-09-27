import { createZodDto } from 'nestjs-zod'
import {
  CartItemDetailSchema,
  CartItemResponseSchema,
  AddToCartBodySchema,
  GetCartResSchema,
  GetCartItemParamsSchema,
  UpdateCartItemBodySchema,
  DeleteCartBodySchema,
} from 'src/modules/cart/models/cart.model'
import { createResponseDTO } from 'src/shared/dtos/response.dto'

export class GetCartItemParamDTO extends createZodDto(GetCartItemParamsSchema) {}

export class CartItemDetailDTO extends createResponseDTO(CartItemDetailSchema) {}

export class CartItemResponseDTO extends createResponseDTO(CartItemResponseSchema) {}

export class GetCartResDTO extends createResponseDTO(GetCartResSchema) {}

export class AddToCartBodyDTO extends createZodDto(AddToCartBodySchema) {}

export class UpdateCartItemBodyDTO extends createZodDto(UpdateCartItemBodySchema) {}

export class DeleteCartBodyDTO extends createZodDto(DeleteCartBodySchema) {}
