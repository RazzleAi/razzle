import { Logger } from '@nestjs/common'
import { ILogger } from '@razzle/services'

export class LoggerService implements ILogger {
  private logger?: Logger
  constructor(context?: string) {
    this.logger = new Logger(context)
  }
  log(message: any, ...optionalParams: any[]) {
    this.logger?.log(message, ...optionalParams)
  }
  error(message: any, ...optionalParams: any[]) {
    this.logger?.error(message, ...optionalParams)
  }
  warn(message: any, ...optionalParams: any[]) {
    this.logger?.warn(message, ...optionalParams)
  }
  debug(message: any, ...optionalParams: any[]) {
    this.logger?.debug(message, ...optionalParams)
  }
  verbose(message: any, ...optionalParams: any[]) {
    this.logger?.verbose(message, ...optionalParams)
  }
}
