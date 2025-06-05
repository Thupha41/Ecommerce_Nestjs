import { createParamDecorator } from '@nestjs/common'

import { ExecutionContext } from '@nestjs/common'

export const UserAgent = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest()
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return request.headers['user-agent'] || 'Unknown'
})
