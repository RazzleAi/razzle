export class DuplicateMatchDomainException extends Error {
  constructor(message: string) {
    super(message)
    Object.setPrototypeOf(this, DuplicateMatchDomainException.prototype)
  }
}