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
import { ProfileModule } from './modules/profile/profile.module'
import { UserModule } from './modules/user/user.module'
import { TransformInterceptor } from './shared/interceptors/transform.interceptor'
import { MediaModule } from './modules/media/media.module'
import { BrandModule } from './modules/brand/brand.module'
import { BrandTranslationModule } from './modules/brand/brand-translation/brand-translation.module'
import { CategoryModule } from './modules/category/category.module'
import { CategoryTranslationModule } from './modules/category/category-translation/category-translation.module'
import { I18nModule, QueryResolver, AcceptLanguageResolver } from 'nestjs-i18n'
import path from 'path'
import { ProductModule } from './modules/product/product.module'
import { ProductTranslationModule } from './modules/product/product-translation/product-translation.module'
@Module({
  imports: [
    SharedModule,
    AuthModule,
    WebSocketModule,
    PermissionModule,
    RoleModule,
    CacheModule.register(),
    LanguageModule,
    ProfileModule,
    UserModule,
    MediaModule,
    BrandModule,
    BrandTranslationModule,
    CategoryModule,
    CategoryTranslationModule,
    ProductModule,
    ProductTranslationModule,
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.resolve('src/i18n/'),
        watch: true,
      },
      resolvers: [{ use: QueryResolver, options: ['lang'] }, AcceptLanguageResolver],
      typesOutputPath: path.resolve('src/generated/i18n.generated.ts'),
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // Custom validation pipe
    // ensure zod DTOs actually validate incoming request data
    {
      provide: APP_PIPE,
      useClass: CustomZodValidationPipe,
    },
    // Serialize response dựa trên zod schema
    { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },

    /*
       Transform response theo dạng { data: T, statusCode: number }
    */
    { provide: APP_INTERCEPTOR, useClass: TransformInterceptor },

    //Xử lý lỗi khi serialize response dựa trên zod schema
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
