import { BadRequestException, NotFoundException } from '@nestjs/common'

export const NotFoundSKUException = new NotFoundException('Error.NotFoundSKU')

export const ProductNotFoundException = new NotFoundException('Error.ProductNotFound')

export const OutOfStockSKUException = new BadRequestException('Error.SKU.NotFound')

export const CartItemNotFoundException = new NotFoundException('Error.CartItem.NotFound')
export const InvalidQuantityException = new BadRequestException('Error.CartItem.InvalidQuantity')
