import { RazzleWidget } from '@razzledotai/widgets'
import { ActionPlanWithDetails } from '../action-plan-with-details'

export interface props {
  ui?: RazzleWidget
  data?: any
  input?: RazzleInput
  error?: RazzleError
  agentError?: RazzleError
  pagination?: {
    frameId?: string
    totalCount: number
    pageNumber: number
    pageSize: number
  }
}

export interface RazzleError {
  message: string
}

/**
 * The response object that is returned from an action.
 */
export class RazzleResponse {
  /**
   * The UI to render in the Razzle app.
   */
  ui?: RazzleWidget
  input?: RazzleInput
  data?: any
  error?: RazzleError
  agentError?: RazzleError
  /**
   * Pagination information for the response.
   */
  pagination?: {
    frameId?: string
    pageNumber: number
    pageSize: number
    totalCount: number
  }

  constructor(props: props) {
    this.ui = props.ui
    this.input = props.input
    this.pagination = props.pagination
    this.data = props.data
    this.error = props.error
    this.agentError = props.agentError
  }
}

export interface RazzleInput {
  action: string
  dataToCollect: RazzleInputDefinition[]  
}

export interface RazzleInputDefinition {
  title: string
  type: string
  name: string
  error?: string
}

export interface ActionAndArgs {
  actionName: string
  actionDescription: string
  actionArgs: {
    name: string
    value: string | ActionPlanWithDetails
    type: string
  }[]
}

export class RazzleResponseWithActionArgs extends RazzleResponse {
  actionAndArgs?: ActionAndArgs
  constructor(razzleResp: RazzleResponse, actionAndArgs?: ActionAndArgs) {
    super(razzleResp)
    this.actionAndArgs = actionAndArgs
  }
}
