import { Module } from '@nestjs/common'
import { UserController } from 'src/modules/user/user.controller'
import { UserRepo } from 'src/modules/user/repository/user.repo'
import { UserService } from 'src/modules/user/user.service'

@Module({
  providers: [UserService, UserRepo, { provide: 'IUserRepository', useClass: UserRepo }],
  controllers: [UserController],
})
export class UserModule {}
