import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { TokenService } from '../services/token.service'
import { REQUEST_USER_KEY } from '../constants/auth.constants'
import { Request } from 'express'

// Extend the Express Request type
interface RequestWithUser extends Request {
  [REQUEST_USER_KEY]: any
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(private readonly tokenService: TokenService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser>()
    const accessToken = request.headers.authorization?.split(' ')?.[1]

    if (!accessToken) {
      throw new UnauthorizedException('No access token provided')
    }

    try {
      const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken)
      request[REQUEST_USER_KEY] = decodedAccessToken
      return true
    } catch {
      throw new UnauthorizedException('Invalid access token')
    }
  }
}
