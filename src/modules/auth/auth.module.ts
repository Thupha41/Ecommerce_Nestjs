import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'

import { AuthRepository } from './repository/auth.repo'
import { GoogleService } from './google.service'

@Module({
  providers: [AuthService, AuthRepository, GoogleService, { provide: 'IAuthRepository', useClass: AuthRepository }],
  controllers: [AuthController],
})
export class AuthModule {}
