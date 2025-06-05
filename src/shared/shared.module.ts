import { Global, Module } from '@nestjs/common'
import { PrismaService } from './services/prisma.service'
import { HashingService } from './services/hashing.service'
import { TokenService } from './services/token.service'
import { JwtModule } from '@nestjs/jwt'
import { AccessTokenGuard } from './guards/access-token.guard'
import { ApiKeyGuard } from './guards/api-key.guard'
import { AuthenticationGuard } from './guards/authentication.guard'
import { SharedUserRepository } from './repositories/shared-user.repo'
import { EmailService } from './services/email.service'

const sharedService = [
  PrismaService,
  HashingService,
  TokenService,
  EmailService,
  AccessTokenGuard,
  ApiKeyGuard,
  AuthenticationGuard,
]

@Global()
@Module({
  providers: [
    ...sharedService,
    {
      provide: 'ISharedUserRepository',
      useClass: SharedUserRepository,
    },
  ],
  exports: [...sharedService, 'ISharedUserRepository'],
  imports: [JwtModule],
})
export class SharedModule {}
