import { Module } from '@nestjs/common'
import { AuthService } from './auth.service'
import { AuthController } from './auth.controller'
import { RolesService } from './role.service'
import { AuthRepository } from './repository/auth.repo'
@Module({
  providers: [AuthService, RolesService, AuthRepository, { provide: 'IAuthRepository', useClass: AuthRepository }],
  controllers: [AuthController],
})
export class AuthModule {}
