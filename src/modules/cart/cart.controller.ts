import { Controller, Get, Query, Post, Body, Param, Put, HttpCode, HttpStatus } from '@nestjs/common'
import { ApiBearerAuth, ApiQuery, ApiTags, ApiBody, ApiParam } from '@nestjs/swagger'
import { CartService } from './cart.service'
import { ActiveUser } from 'src/shared/decorators/active-user.decorator'
import { ZodSerializerDto } from 'nestjs-zod'
import {
  GetCartItemParamDTO,
  GetCartResDTO,
  CartItemResponseDTO,
  AddToCartBodyDTO,
  UpdateCartItemBodyDTO,
  DeleteCartBodyDTO,
} from './cart.dto'
import { PaginationQueryDTO } from 'src/shared/dtos/request.dto'
import { ResponseMessage } from 'src/shared/decorators/response-message.decorator'
import { MessageResDTO } from 'src/shared/dtos/response.dto'

@ApiBearerAuth()
@ApiTags('Cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ResponseMessage('Cart fetched successfully')
  @ZodSerializerDto(GetCartResDTO)
  getCart(@ActiveUser('userId') userId: number, @Query() query: PaginationQueryDTO) {
    return this.cartService.getCart(userId, query)
  }

  @Post()
  @ApiBody({ type: AddToCartBodyDTO })
  @ZodSerializerDto(CartItemResponseDTO)
  @ResponseMessage('Cart item added successfully')
  addToCart(@ActiveUser('userId') userId: number, @Body() body: AddToCartBodyDTO) {
    return this.cartService.addToCart(userId, body)
  }

  @Put(':cartItemId')
  @ApiBody({ type: UpdateCartItemBodyDTO })
  @ApiParam({ name: 'cartItemId', required: true, type: Number })
  @ZodSerializerDto(CartItemResponseDTO)
  @ResponseMessage('Cart item updated successfully')
  updateCartItem(
    @Param() params: GetCartItemParamDTO,
    @Body() body: UpdateCartItemBodyDTO,
    @ActiveUser('userId') userId: number,
  ) {
    return this.cartService.updateCartItem({
      userId,
      cartItemId: params.cartItemId,
      body,
    })
  }

  @Post('delete')
  @ApiBody({ type: DeleteCartBodyDTO })
  @ZodSerializerDto(MessageResDTO)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('{count} cart items deleted from cart {notFoundMessage}', true)
  async deleteCartItem(@ActiveUser('userId') userId: number, @Body() body: DeleteCartBodyDTO) {
    return this.cartService.deleteCartItem(userId, body)
  }
}
