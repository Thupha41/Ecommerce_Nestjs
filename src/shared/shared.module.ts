import { Global, Module } from '@nestjs/common'
import { PrismaService } from './services/prisma.service'
import { HashingService } from './services/hashing.service'
import { TokenService } from './services/token.service'
import { JwtModule } from '@nestjs/jwt'
import { AccessTokenGuard } from './guards/access-token.guard'
import { ApiKeyGuard } from './guards/api-key.guard'
import { AuthenticationGuard } from './guards/authentication.guard'

const sharedService = [PrismaService, HashingService, TokenService, AccessTokenGuard, ApiKeyGuard, AuthenticationGuard]

@Global()
@Module({
  providers: sharedService,
  exports: sharedService,
  imports: [JwtModule],
})
export class SharedModule {}
