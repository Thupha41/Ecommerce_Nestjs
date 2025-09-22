import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { patchNestJsSwagger } from 'nestjs-zod'
import { WebsocketAdapter } from './websockets/websocket.adapter'
import { NestExpressApplication } from '@nestjs/platform-express'
import helmet from 'helmet'

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true })
  app.enableCors()
  app.use(helmet())
  app.useWebSocketAdapter(new WebsocketAdapter(app))
  patchNestJsSwagger()
  const config = new DocumentBuilder()
    .setTitle('ShopDev API')
    .setDescription('ShopDev API description')
    .setVersion('1.0')
    .addBearerAuth()
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api-docs', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })
  await app.listen(process.env.PORT ?? 3000)
}
bootstrap()
