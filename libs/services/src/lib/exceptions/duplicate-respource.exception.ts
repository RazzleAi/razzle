export class DuplicateResourceException extends Error {
  constructor(message = 'Duplicate resource') {
    super(message)

    Object.setPrototypeOf(this, DuplicateResourceException.prototype)
  }
}
