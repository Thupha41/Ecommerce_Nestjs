import { NestFactory } from '@nestjs/core'
import { AppModule } from 'src/app.module'
import { PrismaService } from 'src/shared/services/prisma.service'
import { HTTPMethod } from '@prisma/client'

const prisma = new PrismaService()
async function bootstrap() {
  const app = await NestFactory.create(AppModule)
  await app.listen(3010)
  const server = app.getHttpAdapter().getInstance()
  const router = server.router

  const availableRoutes: [] = router.stack
    .map((layer) => {
      if (layer.route) {
        const path = layer.route?.path
        const method = String(layer.route?.stack[0].method).toUpperCase() as keyof typeof HTTPMethod

        // Generate meaningful description based on method and path
        let description = ''
        const pathParts = path.split('/')
        const resourceName = pathParts[1] ? pathParts[1].replace(/-/g, ' ') : 'resource'

        // Check if path contains ID parameter
        const hasIdParam = path.includes('/:')
        const idParamName = hasIdParam
          ? // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            pathParts[pathParts.findIndex((part) => part.startsWith(':'))]?.replace(':', '')
          : null

        switch (method) {
          case 'GET':
            description = hasIdParam
              ? `Get ${resourceName} details by ${idParamName || 'id'}`
              : `List all ${resourceName}s`
            break
          case 'POST':
            description = `Create a new ${resourceName}`
            break
          case 'PUT':
          case 'PATCH':
            description = `Update ${resourceName} ${hasIdParam ? `by ${idParamName || 'id'}` : ''}`
            break
          case 'DELETE':
            description = `Delete ${resourceName} ${hasIdParam ? `by ${idParamName || 'id'}` : ''}`
            break
          default:
            description = `${method} ${resourceName}`
        }

        return {
          path,
          method,
          name: method + ' ' + path,
          description,
        }
      }
    })
    .filter((item) => item !== undefined)
  console.log(availableRoutes)

  //Add vào database
  try {
    await prisma.permission.createMany({
      data: availableRoutes,
    })
  } catch (error) {
    console.log(error)
  }
  process.exit(0)
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
bootstrap()
