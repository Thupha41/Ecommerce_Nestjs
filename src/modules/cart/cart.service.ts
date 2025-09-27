import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common'
import { CartRepository } from './cart.repo'
import { I18nContext } from 'nestjs-i18n'
import { PaginationQueryType } from 'src/shared/models/request.model'
import { AddToCartBodyType, DeleteCartBodyType, UpdateCartItemBodyType } from './models/cart.model'

@Injectable()
export class CartService {
  constructor(private readonly cartRepository: CartRepository) {}

  getCart(userId: number, query: PaginationQueryType) {
    return this.cartRepository.findAll({
      userId,
      languageId: I18nContext.current()?.lang as string,
      page: query.page,
      limit: (query.limit = 100),
    })
  }

  addToCart(userId: number, body: AddToCartBodyType) {
    return this.cartRepository.create(userId, body)
  }

  updateCartItem({ userId, body, cartItemId }: { userId: number; cartItemId: number; body: UpdateCartItemBodyType }) {
    return this.cartRepository.update({
      userId,
      body,
      cartItemId,
    })
  }

  async deleteCartItem(userId: number, body: DeleteCartBodyType) {
    const { cartItemIds } = body

    // Kiểm tra nếu không có ID nào được cung cấp
    if (!cartItemIds || cartItemIds.length === 0) {
      throw new HttpException('Không có ID nào được cung cấp để xóa', HttpStatus.BAD_REQUEST)
    }

    const { count, notFoundIds } = await this.cartRepository.delete(userId, body)

    // Nếu tất cả ID đều không tồn tại
    if (notFoundIds.length === cartItemIds.length) {
      throw new NotFoundException(`Không tìm thấy cart item nào với các ID: ${notFoundIds.join(', ')}`)
    }

    // Nếu chỉ một số ID không tồn tại
    const notFoundMessage = notFoundIds.length > 0 ? `(IDs không tồn tại: ${notFoundIds.join(', ')})` : ''

    return {
      count,
      notFoundIds,
      notFoundMessage,
    }
  }
}
