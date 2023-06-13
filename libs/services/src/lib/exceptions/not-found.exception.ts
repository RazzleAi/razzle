export class NotFoundException extends Error {
  constructor(message = 'Resource not found') {
    super(message)
    Object.setPrototypeOf(this, NotFoundException.prototype)
  }
}
