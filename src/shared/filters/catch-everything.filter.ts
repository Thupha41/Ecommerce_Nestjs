import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common'
import { HttpAdapterHost } from '@nestjs/core'
import { isUniqueConstraintPrismaError } from '../helpers'

@Catch()
export class CatchEverythingFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost
    if (!httpAdapter) {
      console.error('HttpAdapter is not available')
      return
    }

    const ctx = host.switchToHttp()
    const request = ctx.getRequest()
    if (!request) {
      console.error('Non-HTTP context detected')
      return
    }

    let httpStatus = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string | string[] = 'Internal server error'

    if (exception instanceof HttpException) {
      httpStatus = exception.getStatus()
      const response = exception.getResponse()
      message = typeof response === 'string' ? response : (response as any)?.message || 'Internal server error'
    } else if (isUniqueConstraintPrismaError(exception)) {
      httpStatus = HttpStatus.CONFLICT
      message = 'Duplicate entry detected. Please ensure the data is unique.'
    } else {
      console.error('Unexpected error:', exception)
    }

    const responseBody = {
      statusCode: httpStatus,
      timestamp: new Date().toISOString(),
      path: httpAdapter.getRequestUrl(request),
      message,
      ...(process.env.NODE_ENV !== 'production' && {
        error: exception instanceof Error ? exception.stack : undefined,
      }),
    }

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus)
  }
}
