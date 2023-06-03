export class InvalidHandleException extends Error {
  constructor(message: string) {
    super(message)

    Object.setPrototypeOf(this, InvalidHandleException.prototype)
  }
}
