import { UnprocessableEntityException } from '@nestjs/common'

export const DiscountTranslationAlreadyExistsException = new UnprocessableEntityException([
  {
    path: 'languageId',
    message: 'Error.DiscountTranslationAlreadyExists',
  },
])
