import { SetMetadata } from '@nestjs/common'
import { AuthType, ConditionGuard } from '../constants/auth.constants'

export const AUTH_TYPES_KEY = 'auth_types'

export type AuthTypeDecoratorPayload = {
  authTypes: AuthType[]
  options: { condition: ConditionGuard }
}

export const Auth = (authTypes: AuthType[], options?: { condition: ConditionGuard }) => {
  return SetMetadata(AUTH_TYPES_KEY, { authTypes, options: options ?? { condition: ConditionGuard.AND } })
}
