import { Module } from '@nestjs/common'
import { CartController } from 'src/modules/cart/cart.controller'
import { CartRepository } from 'src/modules/cart/cart.repo'
import { CartService } from 'src/modules/cart/cart.service'
import { DiscountService } from 'src/modules/discount/discount.service'
import { DiscountRepo } from 'src/modules/discount/discount.repo'

@Module({
  providers: [CartService, CartRepository, DiscountService, DiscountRepo],
  controllers: [CartController],
})
export class CartModule {}
