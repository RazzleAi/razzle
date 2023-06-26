/**
 * Your action can accept an optional CallDetails object. This object contains contextual information about the call.
 */
export interface CallDetails {
  /**
   * The ID of the user who is making the function call.
   */
  userId: string
  workspaceId?: string
  context?: {
    [key: string]: any
  }
  headers: Record<string, any>
  /**
   * The ID of the account that the user is making the function call on.
   */
  accountId: string
  /**
   * If the action supports pagination, this object will contain pagination information.
   */
  pagination?: CallDetailsPagination
}

export interface CallDetailsPagination {
  pageNumber: number
  pageSize: number
}
