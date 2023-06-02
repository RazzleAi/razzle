export class DuplicateAppException extends Error {
  constructor(message: string) {
    super(message)

    Object.setPrototypeOf(this, DuplicateAppException.prototype)
  }
}
