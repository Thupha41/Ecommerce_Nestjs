import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { REQUEST_USER_KEY } from '../constants/auth.constants'
import { IAccessTokenPayload } from '../types/jwt.types'
import { Request } from 'express'

interface RequestWithUser extends Request {
  [REQUEST_USER_KEY]?: IAccessTokenPayload
}

export const ActiveUser = createParamDecorator(
  (field: keyof IAccessTokenPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>()
    const user: IAccessTokenPayload | undefined = request[REQUEST_USER_KEY]
    return field ? user && user[field] : user
  },
)
