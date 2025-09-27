import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Reflector } from '@nestjs/core'

export interface Response<T> {
  data: T
}

@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, Response<T>> {
  constructor(private readonly reflector: Reflector) {}
  intercept(context: ExecutionContext, next: CallHandler): Observable<Response<T>> {
    const ctx = context.switchToHttp()
    const response = ctx.getResponse()
    const statusCode = response.statusCode

    // Lấy message từ metadata nếu có
    const messageConfig = this.reflector.get<{ message: string; isTemplate: boolean }>(
      'response_message',
      context.getHandler(),
    ) || { message: 'Success', isTemplate: false }
    const { message: defaultMessage, isTemplate } = messageConfig

    return next.handle().pipe(
      map((result) => {
        // Nếu đã có format chuẩn, trả về nguyên vẹn
        if (result && typeof result === 'object' && 'data' in result && 'statusCode' in result) {
          return result
        }

        let finalMessage = defaultMessage

        // Xử lý template message nếu cần
        if (isTemplate && result && typeof result === 'object') {
          finalMessage = defaultMessage.replace(/\{(\w+)\}/g, (match, key) => {
            return result[key] !== undefined ? String(result[key]) : match
          })
        }

        return {
          data: result,
          statusCode,
          message: finalMessage,
        }
      }),
    )
  }
}
