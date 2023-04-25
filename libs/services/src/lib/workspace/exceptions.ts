export class WorkspaceNotFoundException extends Error {
  constructor(message: string) {
    super(message)

    Object.setPrototypeOf(this, WorkspaceNotFoundException.prototype)
  }
}

export class DuplicateWorkspaceNameException extends Error {
  constructor(message: string) {
    super(message)

    Object.setPrototypeOf(this, DuplicateWorkspaceNameException.prototype)
  }
}