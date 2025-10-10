import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import { patchNestJsSwagger } from 'nestjs-zod'
import { WebsocketAdapter } from './websockets/websocket.adapter'
import { NestExpressApplication } from '@nestjs/platform-express'
import helmet from 'helmet'
import { Logger } from 'nestjs-pino'
import envConfig from './shared/config'
async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bufferLogs: true })
  app.useLogger(app.get(Logger))
  app.set('trust proxy', 'loopback')
  app.enableCors()
  app.use(helmet());
  patchNestJsSwagger()
  const config = new DocumentBuilder()
    .setTitle('ShopDev API')
    .setDescription('ShopDev API description')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey(
      {
        name: 'authorization',
        type: 'apiKey',
      },
      'payment-api-key',
    )
    .addServer(envConfig.PRODUCTION_URL, 'Production')
    .addServer(envConfig.DEVELOPMENT_URL, 'Development')
    .build()
  const documentFactory = () => SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api-docs', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  })

  const websocketAdapter = new WebsocketAdapter(app)
  await websocketAdapter.connectToRedis()
  app.useWebSocketAdapter(websocketAdapter)
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0')
  console.log(`Swagger UI: ${await app.getUrl()}/api-docs`);
  console.log(`Application is running on: ${await app.getUrl()}`)
}
bootstrap()
