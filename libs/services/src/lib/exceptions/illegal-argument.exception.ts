export class IllegalArgumentException extends Error {
  constructor(message = 'Illegal argument') {
    super(message)

    Object.setPrototypeOf(this, IllegalArgumentException.prototype)
  }
}
