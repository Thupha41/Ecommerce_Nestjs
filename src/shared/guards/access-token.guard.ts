import { CACHE_MANAGER } from '@nestjs/cache-manager'
import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  Inject,
} from '@nestjs/common'
import { Cache } from 'cache-manager'
import { keyBy } from 'lodash'
import { REQUEST_ROLE_PERMISSIONS, REQUEST_USER_KEY } from 'src/shared/constants/auth.constants'
import { HTTPMethod } from 'src/shared/constants/permission.constants'
import { RolePermissionsType } from 'src/shared/models/shared-role.model'
import { PrismaService } from 'src/shared/services/prisma.service'
import { TokenService } from 'src/shared/services/token.service'
import { IAccessTokenPayload } from 'src/shared/types/jwt.types'

type Permission = RolePermissionsType['permissions'][number]
// Định nghĩa kiểu dữ liệu cho role đã cache
type CachedRole = {
  id: number
  name: string
  description: string
  isActive: boolean
  createdById: number | null
  updatedById: number | null
  deletedById: number | null
  deletedAt: Date | null
  createdAt: Date
  updatedAt: Date
  permissions: {
    [key: string]: Permission
  }
}

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokenService: TokenService,
    private readonly prismaService: PrismaService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    // Extract và validate token
    const decodedAccessToken = await this.extractAndValidateToken(request)

    // Check user permission
    await this.validateUserPermission(decodedAccessToken, request)
    return true
  }

  private async extractAndValidateToken(request: any): Promise<IAccessTokenPayload> {
    const accessToken = this.extractAccessTokenFromHeader(request)
    try {
      const decodedAccessToken = await this.tokenService.verifyAccessToken(accessToken)

      request[REQUEST_USER_KEY] = decodedAccessToken
      return decodedAccessToken
    } catch {
      throw new UnauthorizedException('Error.InvalidAccessToken')
    }
  }

  private extractAccessTokenFromHeader(request: any): string {
    const accessToken = request.headers.authorization?.split(' ')[1]
    if (!accessToken) {
      throw new UnauthorizedException('Error.MissingAccessToken')
    }
    return accessToken
  }

  private async validateUserPermission(decodedAccessToken: IAccessTokenPayload, request: any): Promise<void> {
    const roleId: number = decodedAccessToken.roleId
    const path: string = request.route.path
    const method = request.method as keyof typeof HTTPMethod
    const cacheKey = `role:${roleId}`
    // 1. Thử lấy từ cache
    let cachedRole = await this.cacheManager.get<CachedRole>(cacheKey)
    // 2. Nếu không có trong cache, thì truy vấn từ cơ sở dữ liệu
    if (cachedRole === null) {
      const role = await this.prismaService.role
        .findUniqueOrThrow({
          where: {
            id: roleId,
            deletedAt: null,
            isActive: true,
          },
          include: {
            permissions: {
              where: {
                deletedAt: null,
              },
            },
          },
        })
        .catch(() => {
          throw new ForbiddenException()
        })

      const permissionObject = keyBy(
        role.permissions,
        (permission) => `${permission.path}:${permission.method}`,
      ) as CachedRole['permissions']
      // Chuyển đổi sang CachedRole
      cachedRole = {
        id: role.id,
        name: role.name,
        description: role.description,
        isActive: role.isActive,
        createdById: role.createdById,
        updatedById: role.updatedById,
        deletedById: null, // Gán giá trị mặc định
        deletedAt: role.deletedAt,
        createdAt: role.createdAt,
        updatedAt: role.updatedAt,
        permissions: permissionObject,
      }
      await this.cacheManager.set(cacheKey, cachedRole, 1000 * 60 * 60) // Cache for 1 hour

      request[REQUEST_ROLE_PERMISSIONS] = role
    }

    // 3. Kiểm tra quyền truy cập
    const canAccess: Permission | undefined = cachedRole?.permissions[`${path}:${method}`]
    if (!canAccess) {
      throw new ForbiddenException()
    }
  }
}
