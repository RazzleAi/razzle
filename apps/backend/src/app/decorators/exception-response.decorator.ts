import { applyDecorators, SetMetadata, Type, UseInterceptors } from '@nestjs/common'
import { ExceptionResponseInterceptor } from '../interceptors'

export interface ExceptionResponseDetails {
  statusCode: number
  message?: string
  types: Type[]
}

export const EXCEPTION_RESPONSE_KEY = 'exception_response'

/**
 * USAGE: @ExceptionResponse({types: [ExceptionClass1, ExceptionClass2], statusCode: HttpStatus.CONFLICT, message: 'An error occurred'}, ...)
 */
export const ExceptionResponse = (...details: ExceptionResponseDetails[]) =>
  SetMetadata(EXCEPTION_RESPONSE_KEY, details)

export const UseExceptionResponseHandler = () => applyDecorators(UseInterceptors(ExceptionResponseInterceptor))
