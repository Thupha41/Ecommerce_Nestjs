import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { RolesService } from './role.service'
import { AuthRepository } from './repository/auth.repo'
import { GoogleService } from './google.service'

@Module({
  providers: [
    AuthService,
    RolesService,
    AuthRepository,
    GoogleService,
    { provide: 'IAuthRepository', useClass: AuthRepository },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
