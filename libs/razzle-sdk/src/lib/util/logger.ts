export default class Logger {
  private static instance: Logger
  private isDebug: boolean
  private constructor() {
    this.isDebug = process.env.NODE_ENV === 'development'
  }

  static getInstance() {
    if (!Logger.instance) {
      Logger.instance = new Logger()
    }
    return Logger.instance
  }

  log(message: string, ...optionalParams: any[]) {
    console.log(message, ...optionalParams)
  }

  debug(message: string, ...optionalParams: any[]) {
    if (this.isDebug) {
      console.debug(message, ...optionalParams)
    }
  }

  error(message: string, ...optionalParams: any[]) {
    console.error(message, ...optionalParams)
  }
}
