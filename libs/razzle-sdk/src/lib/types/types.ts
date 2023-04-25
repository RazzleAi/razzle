import { CallDetails } from '../call-details'
import { ActionDecoratorArgs } from '../decorators'

export type RequestType =
  | 'SyncApp'
  | 'FuncResponse'
  | 'AuthenticateResponse'
  | 'UserAppAuthentication'
export type MessageType =
  | 'CallFunction'
  | 'SyncAppResponse'
  | 'SyncAppResponse'
  | 'Authenticate'

export type AuthFunction = (appId: string, callDetails: CallDetails) => string

export interface Handler extends ActionDecoratorArgs {
  appInstance: any
  methodToCall: string
  methodParamLen: number
  methodParams: HandlerMethodParams[]
  isPromise: boolean
}

export interface HandlerMethodParams {
  paramIndex: number
  // eslint-disable-next-line @typescript-eslint/ban-types
  paramTypeCtor: Function
  paramTypeStr: string
  paramName: string
}

export type HandlerContext = {
  appId: string
  userId: string
  action: string
  data?: { [key: string]: string }
}

export interface SyncAppPayload {
  sdkVersion: string
  requiresAuth: boolean
  actions: {
    name: string
    description: string
    stealth?: boolean
    paged?: boolean
    examples: { title: string; args: string[] }[]
    parameters: {
      name: string
      type: string
    }[]
  }[]
}

export interface ActionTriggerPayload {
  action: string
  arguments: {
    name: string
    value: any
  }[]
}

export interface ServerRequest {
  event: RequestType
  data: ServerRequestData
}

export interface ServerRequestData {
  headers?: { [key: string]: string }
  payload: unknown
}

export interface ServerMessage {
  event: MessageType
  data: ServerMessageData
}

export interface ServerMessageData {
  headers?: { [key: string]: string }
  payload: unknown
}

export interface AuthenticationRequestPayload {
  clientId: string
  applicationId: string
  userId: string
  accountId: string
  context?: { [key: string]: any }
}

export interface AuthenticationRequestHeader {
  clientId: string
  applicationId: string
  userId: string
  accountId: string
  context?: { [key: string]: any }
}

export interface AppSyncResponsePayload {
  success: boolean
}
