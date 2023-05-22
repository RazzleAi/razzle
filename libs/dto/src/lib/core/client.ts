import { RazzleResponse, RazzleResponseWithActionArgs } from '@razzledotai/sdk'
import { Message } from './message'
import { ServerMessage, ServerMessageV2 } from './server'
import { StepDto } from '../workspace'

export interface ClientRequest {
  accountId: string
  workspaceId: string
  payload: {
    steps?: StepDto[]
    prompt?: string
    pagination?: Pagination
    chatId?: string
  }
  headers?: NodeJS.Dict<string | any>
}

export interface ClientToEngineRequest extends ClientRequest {
  userId: string
  clientId: string
}

// export interface ClientRequestWithPagination extends ClientRequest {
//   payload: (string | { steps: StepDto[]; prompt?: string }) & {
//     pagination: Pagination
//   }
// }

export interface ClientResponse {
  clientId: string
  headers?: NodeJS.Dict<string | string[]>
  payload: (RazzleResponse | RazzleResponseWithActionArgs) & {
    appId: string
    razzleAppId: string
    appName: string
    requestPrompt?: string
    appDescription?: string
    [key: string]: any
  }
}

export type ClientMessageType = 'CallAction' | 'Ping' | 'Message'

/**
 * @deprecated Use ClientMessageV3 instead
 */
export interface ClientMessage extends Message {
  frameId?: string
  type: ClientMessageType
  data?: CallActionData[]
}

export interface CallActionData {
  action: string
  prompt?: string
  appId: string
  args: {
    arg: string
    value: any
  }[]
}

/**
 * @deprecated Use ClientMessageV3 instead
 */
export interface ClientMessageV2 extends Message {
  frameId?: string
  type: ClientMessageType
  data: string
}

export interface ClientMessageV3 extends Message {
  frameId?: string
  type: ClientMessageType
  data: ClientRequest
}

export interface ClientHistoryItemDto {
  id?: string
  isFramed?: boolean
  hash: string
  message:
    | ClientMessage
    | ServerMessage
    | ClientMessageV2
    | ClientMessageV3
    | ServerMessageV2
  timestampMillis: number
}

export type Pagination = {
  pageNumber: number
  pageSize: number
  totalCount: number
  frameId?: string
}
