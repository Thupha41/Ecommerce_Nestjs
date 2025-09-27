import { Module } from '@nestjs/common'
import { CartController } from 'src/modules/cart/cart.controller'
import { CartRepository } from 'src/modules/cart/cart.repo'
import { CartService } from 'src/modules/cart/cart.service'

@Module({
  providers: [CartService, CartRepository],
  controllers: [CartController],
})
export class CartModule {}
