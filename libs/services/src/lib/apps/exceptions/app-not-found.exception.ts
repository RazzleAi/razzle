export class AppNotFoundException extends Error {
    constructor(message = 'App not found') {
      super(message)
  
      Object.setPrototypeOf(this, AppNotFoundException.prototype)
    }
  }
  