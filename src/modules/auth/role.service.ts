import { Injectable } from '@nestjs/common'
import { RoleName } from 'src/shared/constants/role.constants'
import { PrismaService } from 'src/shared/services/prisma.service'
import { RoleType } from 'src/shared/models/shared-role.model'

@Injectable()
export class RolesService {
  private clientRoleId: number | null = null
  constructor(private readonly prismaService: PrismaService) {}

  async getClientRoleId() {
    if (this.clientRoleId) {
      return this.clientRoleId
    }
    const role: RoleType = await this.prismaService.$queryRaw`
      SELECT * FROM roles WHERE name = ${RoleName.Client} AND deletedAt IS NULL LIMIT 1
    `.then((res: RoleType[]) => {
      if (res.length == 0) {
        throw new Error('Client role not found')
      }
      return res[0]
    })
    if (!role) {
      throw new Error('Client role not found')
    }
    this.clientRoleId = role.id
    return role.id
  }
}
