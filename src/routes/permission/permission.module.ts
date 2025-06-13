import { Module } from '@nestjs/common'
import { PermissionRepository } from './repository/permission.repo'
import { PermissionController } from './permission.controller'
import { PermissionService } from './permission.service'
@Module({
  providers: [
    PermissionService,
    PermissionRepository,
    { provide: 'IPermissionRepository', useClass: PermissionRepository },
  ],
  controllers: [PermissionController],
})
export class PermissionModule {}
