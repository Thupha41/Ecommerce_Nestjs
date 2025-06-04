import { ConflictException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common'
import { HashingService } from 'src/shared/services/hashing.service'
import { PrismaService } from 'src/shared/services/prisma.service'
import { TokenService } from 'src/shared/services/token.service'
import { isUniqueConstraintError, isNotFoundError } from 'src/shared/helpers'
import { RolesService } from './role.service'
import { RegisterBodyDTO } from './auth.dto'
@Injectable()
export class AuthService {
  constructor(
    private readonly hashingService: HashingService,
    private readonly prismaService: PrismaService,
    private readonly tokenService: TokenService,
    private readonly roleService: RolesService,
  ) {}

  async register(body: RegisterBodyDTO) {
    try {
      const clientRoleId = await this.roleService.getClientRoleId()
      const hashingPassword = await this.hashingService.hash(body.password)
      const user = await this.prismaService.user.create({
        data: {
          email: body.email,
          name: body.name,
          password: hashingPassword,
          phoneNumber: body.phoneNumber,
          roleId: clientRoleId,
        },
        omit: {
          password: true,
          totpSecret: true,
        },
      })
      return user
    } catch (error) {
      console.log('>>> check register error', error)
      if (isUniqueConstraintError(error)) {
        if (error.meta?.target instanceof Array && error.meta.target[0] === 'email') {
          throw new ConflictException('Email already exists')
        }
      }
      throw error
    }
  }

  async login(body: any) {
    //check email exist in db
    const checkEmailExist = await this.prismaService.user.findUnique({
      where: {
        email: body.email,
      },
    })
    if (!checkEmailExist) {
      throw new UnauthorizedException('Email not found')
    }

    //check password is match in db
    const isPassMatch = await this.hashingService.compare(body.password, checkEmailExist.password)
    // if (!isPassMatch) throw new UnauthorizedException('Password does not match, please try again')

    if (!isPassMatch) {
      throw new UnprocessableEntityException([
        {
          field: 'password',
          error: 'Password is incorrect',
        },
      ])
    }

    const token = await this.generateTokens({ userId: checkEmailExist.id })

    return token
  }

  async generateTokens(payload: { userId: number }) {
    const [accessToken, refreshToken] = await Promise.all([
      this.tokenService.signAccessToken(payload),
      this.tokenService.signRefreshToken(payload),
    ])

    const decodeRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken)

    await this.prismaService.refreshToken.create({
      data: {
        token: refreshToken,
        userId: payload.userId,
        expiresAt: new Date(decodeRefreshToken.exp * 1000),
      },
    })

    return {
      accessToken,
      refreshToken,
    }
  }

  async refreshToken(body: any) {
    try {
      //verify refresh token
      const { userId } = await this.tokenService.verifyRefreshToken(body.refreshToken)

      //check refresh token exist
      const checkRefreshTokenExist = await this.prismaService.refreshToken.findUniqueOrThrow({
        where: {
          token: body.refreshToken,
        },
      })
      if (!checkRefreshTokenExist) {
        throw new UnauthorizedException('Refresh token not found')
      }
      //xóa refresh token cũ
      await this.prismaService.refreshToken.delete({
        where: {
          token: body.refreshToken,
        },
      })

      //tạo token mới
      const token = await this.generateTokens({ userId })

      return token
    } catch (error) {
      console.log('>>> check refresh token error', error)
      if (isNotFoundError(error)) {
        throw new UnauthorizedException('Refresh has been revoked')
      }
      throw new UnauthorizedException('Refresh token not found')
    }
  }

  async logout(body: any) {
    try {
      //verify refresh token
      await this.tokenService.verifyRefreshToken(body.refreshToken)

      //check refresh token exist
      const checkRefreshTokenExist = await this.prismaService.refreshToken.findUniqueOrThrow({
        where: {
          token: body.refreshToken,
        },
      })
      if (!checkRefreshTokenExist) {
        throw new UnauthorizedException('Refresh token not found')
      }
      //xóa refresh token cũ
      await this.prismaService.refreshToken.delete({
        where: {
          token: body.refreshToken,
        },
      })

      return {
        message: 'Logout successfully',
      }
    } catch (error) {
      console.log('>>> check refresh token error', error)
      if (isNotFoundError(error)) {
        throw new UnauthorizedException('Refresh has been revoked')
      }
      throw new UnauthorizedException('Refresh token not found')
    }
  }
}
