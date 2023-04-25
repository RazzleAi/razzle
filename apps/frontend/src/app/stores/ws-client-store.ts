import { ClientRequest, ClientToServerMessage, StepDto } from '@razzle/dto'
import create from 'zustand'
import { devtools } from 'zustand/middleware'
import {
  CallbackHandle,
  OnWsConnected,
  OnWsDisconnected,
  OnWsMessageReceived,
  WsServer,
} from '../websocket-client'

export interface WSClientStore {
  isConnected: boolean
  wsClient: WsServer
  // setConnected: (isConnected: boolean) => void
  setOnConnected: (cb: OnWsConnected) => CallbackHandle
  removeOnConnected: (handle: CallbackHandle) => any
  setOnDisconnected: (cb: OnWsDisconnected) => CallbackHandle
  removeOnDisconnected: (handle: CallbackHandle) => any
  setOnMessageReceived: (cb: OnWsMessageReceived) => CallbackHandle
  removeOnMessageReceived: (handle: CallbackHandle) => any
  sendMessage: (
    accessToken: string,
    message: ClientToServerMessage<ClientRequest>
  ) => any
  identify: (accessToken: string, workspaceId: string, accountId: string) => any
  triggerActions: (
    accessToken: string,
    accountId: string,
    workspaceId: string,
    steps: StepDto[],
    prompt?: string
  ) => void
  triggerPaginationAction: (
    accessToken: string,
    accountId: string,
    workspaceId: string,
    prompt: string,
    steps: StepDto[],
    pagination: any
  ) => void
}

const wsClient = new WsServer()

export const useWSClientStore = create<WSClientStore>()(
  devtools((set, get) => ({
    isConnected: false,
    wsClient: wsClient,
    setOnConnected: (cb: OnWsConnected) => {
      return get().wsClient.addOnConnected(cb)
    },
    removeOnConnected: (handle: CallbackHandle) => {
      get().wsClient.removeOnConnected(handle)
    },
    setOnDisconnected: (cb: OnWsDisconnected) => {
      return get().wsClient.addOnDisconnected(cb)
    },
    removeOnDisconnected: (handle: CallbackHandle) => {
      get().wsClient.removeOnDisconnected(handle)
    },
    setOnMessageReceived: (cb: OnWsMessageReceived) => {
      return get().wsClient.addOnMessageReceived(cb)
    },
    removeOnMessageReceived: (handle: CallbackHandle) => {
      get().wsClient.removeOnMessageReceived(handle)
    },
    sendMessage: (
      accessToken: string,
      message: ClientToServerMessage<ClientRequest>
    ) => {
      get().wsClient.sendMessage(accessToken, message)
    },
    identify: (accessToken: string, workspaceId: string, accountId: string) => {
      get().wsClient.identify(accessToken, workspaceId, accountId)
    },
    triggerActions: (
      accessToken: string,
      accountId: string,
      workspaceId: string,
      steps: StepDto[],
      prompt?: string
    ) => {
      get().wsClient.sendMessage(accessToken, {
        event: 'Message',
        data: {
          accountId,
          workspaceId,
          payload: { steps, prompt },
        },
      } as ClientToServerMessage<ClientRequest>)
    },
    triggerPaginationAction: (
      accessToken: string,
      accountId: string,
      workspaceId: string,
      prompt: string,
      steps: StepDto[],
      pagination: any
    ) => {
      get().wsClient.sendMessage(accessToken, {
        event: 'Message',
        data: {
          accountId,
          workspaceId,
          payload: { steps, pagination, prompt },
        },
      } as ClientToServerMessage<ClientRequest>)
    },
  }))
)
