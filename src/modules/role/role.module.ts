import { Module } from '@nestjs/common'
import { RoleController } from 'src/modules/role/role.controller'
import { RoleRepo } from 'src/modules/role/repository/role.repo'
import { RoleService } from 'src/modules/role/role.service'
import { CacheModule } from '@nestjs/cache-manager'

@Module({
  imports: [CacheModule.register()],
  providers: [RoleService, RoleRepo, { provide: 'IRoleRepository', useClass: RoleRepo }],
  controllers: [RoleController],
  exports: [RoleService],
})
export class RoleModule {}
