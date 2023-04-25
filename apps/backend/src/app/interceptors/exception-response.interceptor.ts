import {
  CallHandler,
  ExecutionContext,
  Injectable,
  InternalServerErrorException,
  Logger,
  NestInterceptor,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { catchError, Observable, throwError } from 'rxjs'
import {
  ExceptionResponseDetails,
  EXCEPTION_RESPONSE_KEY,
} from '../decorators/exception-response.decorator'
import { Response } from '@razzle/dto'

@Injectable()
export class ExceptionResponseInterceptor<T>
  implements NestInterceptor<T, Response<T>>
{
  private readonly logger = new Logger(ExceptionResponseInterceptor.name)

  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<Response<T>> | Promise<Observable<Response<T>>> {
    return next.handle().pipe(
      catchError((err) =>
        throwError(() => {
          const exceptionResponseHandlers = this.reflector.getAllAndOverride<
            ExceptionResponseDetails[]
          >(EXCEPTION_RESPONSE_KEY, [context.getHandler()])
          if (!exceptionResponseHandlers) {
            return new InternalServerErrorException()
          }

          for (const handler of exceptionResponseHandlers) {
            const { types, statusCode, message } = handler
            if (types.some((typ) => err instanceof typ)) {
              return {
                statusCode: statusCode,
                message: message || (err as Error).message, // || Array.isArray(err.message) ? err.message[0] : err.message,
                error: message || (err as Error).message, // || Array.isArray(err.message) ? err.message[0] : err.message,
              }
            }
          }
          return err
        })
      )
    )
  }
}
