export class DuplicateUserException extends Error {
  constructor(message: string) {
    super(message)

    Object.setPrototypeOf(this, DuplicateUserException.prototype)
  }
}
