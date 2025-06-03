import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AUTH_TYPE, ConditionGuard } from '../constants/auth.constants'
import { AUTH_TYPES_KEY, AuthTypeDecoratorPayload } from '../decorators/auth.decorator'
import { AccessTokenGuard } from './access-token.guard'
import { ApiKeyGuard } from './api-key.guard'
@Injectable()
export class AuthenticationGuard implements CanActivate {
  private readonly authTypeGuardMap: Record<string, CanActivate>

  constructor(
    private readonly reflector: Reflector,
    private readonly accessTokenGuard: AccessTokenGuard,
    private readonly apiKeyGuard: ApiKeyGuard,
  ) {
    this.authTypeGuardMap = {
      [AUTH_TYPE.BEARER]: this.accessTokenGuard,
      [AUTH_TYPE.API_KEY]: this.apiKeyGuard,
      [AUTH_TYPE.NONE]: { canActivate: () => true },
    }
  }
  private async handleOrCondition(guards: CanActivate[], context: ExecutionContext): Promise<boolean> {
    let error: Error | UnauthorizedException = new UnauthorizedException()
    for (const guard of guards) {
      try {
        const canActivate = await Promise.resolve(guard.canActivate(context))
        if (canActivate) return true
      } catch (err) {
        error = err instanceof Error ? err : new UnauthorizedException()
      }
    }
    throw error
  }

  private async handleAndCondition(guards: CanActivate[], context: ExecutionContext): Promise<boolean> {
    let error: Error | UnauthorizedException = new UnauthorizedException()
    for (const guard of guards) {
      try {
        const canActivate = await Promise.resolve(guard.canActivate(context))
        if (!canActivate) {
          throw new UnauthorizedException()
        }
      } catch (err) {
        error = err instanceof Error ? err : new UnauthorizedException()
        throw error
      }
    }
    return true
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authTypeVal = this.reflector.getAllAndOverride<AuthTypeDecoratorPayload | undefined>(AUTH_TYPES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]) ?? { authTypes: [AUTH_TYPE.NONE], options: { condition: ConditionGuard.AND } }

    //Log cho thấy metadata là: {authTypes: ['Bearer', 'ApiKey'], options: {condition: 'OR'}}
    console.log('>>> check authTypeVal', authTypeVal)

    const guards = authTypeVal.authTypes.map((authType) => this.authTypeGuardMap[authType])

    console.log('>>> check guards', guards)

    return authTypeVal.options.condition === ConditionGuard.OR
      ? this.handleOrCondition(guards, context)
      : this.handleAndCondition(guards, context)
  }
}
