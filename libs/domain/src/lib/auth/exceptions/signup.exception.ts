export class SignupException extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, SignupException.prototype)
  }
}
