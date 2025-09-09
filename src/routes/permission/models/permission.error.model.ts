import { ConflictException, NotFoundException } from '@nestjs/common'

export const PermissionNotFoundException = new NotFoundException('Error.PermissionNotFound')
export const PermissionAlreadyExistsException = new ConflictException([
  {
    message: 'Error.PermissionAlreadyExists',
    path: 'path',
  },
  {
    message: 'Error.PermissionAlreadyExists',
    path: 'method',
  },
])
