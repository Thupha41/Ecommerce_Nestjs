import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import envConfig from '../config'
import { Request } from 'express'

@Injectable()
export class ApiKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>()
    const xApiKey = request.headers['x-api-key'] as string | undefined
    if (xApiKey !== envConfig.SECRET_API_KEY) {
      throw new UnauthorizedException('No api key provided')
    }
    return true
  }
}
