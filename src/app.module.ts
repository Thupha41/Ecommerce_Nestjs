import { Module } from '@nestjs/common'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { SharedModule } from './shared/shared.module'
import { APP_INTERCEPTOR, APP_PIPE, APP_FILTER } from '@nestjs/core'
import { AuthModule } from './modules/auth/auth.module'
import CustomZodValidationPipe from './shared/pipes/custom-validation.pipe'
import { ZodSerializerInterceptor } from 'nestjs-zod'
import { HttpExceptionFilter } from './shared/filters/http-exception.filter'
import { CatchEverythingFilter } from './shared/filters/catch-everything.filter'
import { WebSocketModule } from './websockets/websocket.module'
import { PermissionModule } from './modules/permission/permission.module'
import { RoleModule } from './modules/role/role.module'
import { CacheModule } from '@nestjs/cache-manager'
import { LanguageModule } from './modules/language/language.module'
@Module({
  imports: [
    SharedModule,
    AuthModule,
    WebSocketModule,
    PermissionModule,
    RoleModule,
    CacheModule.register(),
    LanguageModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Custom validation pipe
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    // Serialize response dựa trên zod schema
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },

    //Xử lý lỗi khi serialize response
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    //Xử lý lỗi khi để catch exception
    {
      provide: APP_FILTER,
      useClass: CatchEverythingFilter,
    },
  ],
})
export class AppModule {}
