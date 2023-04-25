import { RazzleResponse, RazzleResponseWithActionArgs } from '@razzledotai/sdk'
import { ClientResponse } from '../core'
import { Message, ServerMessageType } from './message'

/**
 * @deprecated Use ServerMessageV2 instead
 */
export interface ServerMessage extends Message {
  type: ServerMessageType
  frameId?: string
  data: {
    appId: string
    applicationId: string
    appName: string
    appDescription: string
    message: RazzleResponse | RazzleResponseWithActionArgs
  }
}

export interface ServerMessageV2 extends Message {
  type: ServerMessageType
  frameId?: string
  data: ClientResponse
}
