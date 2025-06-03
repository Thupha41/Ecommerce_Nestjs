export const REQUEST_USER_KEY = 'user'
export const AUTH_TYPE = {
  BEARER: 'Bearer',
  API_KEY: 'ApiKey',
  NONE: 'None',
} as const

export type AuthType = (typeof AUTH_TYPE)[keyof typeof AUTH_TYPE]

export const ConditionGuard = {
  AND: 'and',
  OR: 'or',
} as const

export type ConditionGuard = (typeof ConditionGuard)[keyof typeof ConditionGuard]
