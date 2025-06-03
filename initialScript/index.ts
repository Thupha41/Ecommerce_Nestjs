import envConfig from 'src/shared/config'
import { RoleName } from 'src/shared/constants/role.constants'
import { PrismaService } from 'src/shared/services/prisma.service'
import { HashingService } from 'src/shared/services/hashing.service'
const prisma = new PrismaService()
const hashingService = new HashingService()
const main = async () => {
  const roleCount = await prisma.role.count()
  if (roleCount > 0) {
    throw new Error('Roles already exist')
  }

  const roles = await prisma.role.createMany({
    data: [
      {
        name: RoleName.Admin,
        description: 'Admin role',
      },
      {
        name: RoleName.Client,
        description: 'Client role',
      },
      {
        name: RoleName.Seller,
        description: 'Seller role',
      },
    ],
  })

  const adminRole = await prisma.role.findFirstOrThrow({
    where: {
      name: RoleName.Admin,
    },
  })

  const adminUser = await prisma.user.create({
    data: {
      email: envConfig.ADMIN_EMAIL,
      password: await hashingService.hash(envConfig.ADMIN_PASSWORD),
      name: envConfig.ADMIN_NAME,
      phoneNumber: envConfig.ADMIN_PHONE_NUMBER,
      roleId: adminRole.id,
    },
  })

  return {
    createdRolesCount: roles.count,
    adminUser,
    adminRole,
  }
}

main()
  .then(({ adminUser, adminRole, createdRolesCount }) => {
    console.log(`Created ${createdRolesCount} roles`)
    console.log(`Admin user created: ${adminUser.id}`)
    console.log(`Admin role created: ${adminRole.id}`)
  })
  .catch((error) => {
    console.error(error)
  })
