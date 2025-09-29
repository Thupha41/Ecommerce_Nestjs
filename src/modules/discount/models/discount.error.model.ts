import { BadRequestException, NotFoundException } from '@nestjs/common'

export const DiscountStartDateMustBeBeforeEndDateException = new BadRequestException(
  'Error.DiscountStartDateMustBeBeforeEndDate',
)

export const DiscountAlreadyExistsException = new BadRequestException('Error.DiscountAlreadyExists')
export const DiscountCodeAlreadyExistsException = new BadRequestException('Error.DiscountCodeAlreadyExists')
export const DiscountCodeInvalidException = new BadRequestException('Error.DiscountCodeInvalid')
export const DiscountCodeExpiredException = new BadRequestException('Error.DiscountCodeExpired')
export const DiscountCodeNotValidException = new BadRequestException('Error.DiscountCodeNotValid')
export const DiscountCodeNotFoundException = new NotFoundException('Error.DiscountCodeNotFound')
export const DiscountMaxUsesReachedException = new BadRequestException('Error.DiscountMaxUsesReached')
export const DiscountMaxUsesPerUserReachedException = new BadRequestException('Error.DiscountMaxUsesPerUserReached')
