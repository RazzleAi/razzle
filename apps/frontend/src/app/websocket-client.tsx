import { ClientRequest, ClientToServerMessage } from '@razzle/dto'
import { v4 as uuidv4 } from 'uuid'
import { environment } from '../environments/environment'

export type OnWsMessageReceived = (message: any) => any

export type OnWsDisconnected = (reason: string, code: number) => void

export type OnWsConnected = VoidFunction

export type CallbackHandle = string

export class WsServer {
  private serverSocket: WebSocket
  private messageListeners: Map<CallbackHandle, OnWsMessageReceived> = new Map()
  private disconnectListeners: Map<CallbackHandle, OnWsDisconnected> = new Map()
  private connectListeners: Map<CallbackHandle, OnWsConnected> = new Map()

  private retryCount = 0
  private backoffTimeMillis = 2000

  public get isConnected() {
    return this.serverSocket.readyState === WebSocket.OPEN
  }

  constructor() {
    this.connect()
  }

  private connect() {
    this.serverSocket = new WebSocket(environment.wsBaseUrl)
    this.serverSocket.onopen = this.onConnected.bind(this)
    this.serverSocket.onclose = this.onDisconnected.bind(this)
    this.serverSocket.onmessage = this.onServerMessage.bind(this)
  }

  private onServerMessage(evt: MessageEvent) {
    const { data, type } = evt
    if (type === 'binary') {
      console.warn(
        'Server: Cannot currently handle binary data. Ignoring message.'
      )
      return
    }

    if (data === 'pong') {
      return
    }

    this.messageListeners.forEach((val, key) => {
      val?.call(this, data)
    })
  }

  sendMessage(
    accessToken: string,
    message: ClientToServerMessage<ClientRequest>
  ) {
    if (!message.data.headers) {
      message.data.headers = {}
    }
    message.data.headers['accessToken'] = accessToken

    const messageStr = JSON.stringify(message)
    this.serverSocket.send(messageStr)
  }

  private onConnected() {
    console.debug('Server: Connection established with server')
    this.connectListeners.forEach((val, key) => {
      val?.call(this)
    })
    this.startPing()
  }

  private pingTimer?: NodeJS.Timer
  private startPing() {
    this.pingTimer = setInterval(() => {
      this.serverSocket.send('ping')
    }, 10000)
  }

  private onDisconnected(ev: CloseEvent) {
    const { code, reason } = ev
    console.debug('Server: Closed connection due to ', code, reason.toString())
    if (this.pingTimer) {
      clearInterval(this.pingTimer)
    }
    this.disconnectListeners.forEach((val, key) => {
      val?.call(this, reason.toString(), code)
    })

    this.retryConnect()
  }

  private async retryConnect() {
    await this.sleep()
    console.debug(`Server: Attempt ${this.retryCount + 1} to connect...`)
    this.retryCount += 1
    this.connect()
  }

  public addOnMessageReceived(listener: OnWsMessageReceived): CallbackHandle {
    const handle = uuidv4()
    this.messageListeners.set(handle, listener)
    return handle
  }

  public removeOnMessageReceived(handle: CallbackHandle) {
    if (this.messageListeners.has(handle)) {
      this.messageListeners.delete(handle)
    }
  }

  public addOnDisconnected(listener: OnWsDisconnected): CallbackHandle {
    const handle = uuidv4()
    this.disconnectListeners.set(handle, listener)
    return handle
  }

  public removeOnDisconnected(handle: CallbackHandle) {
    if (this.disconnectListeners.has(handle)) {
      this.disconnectListeners.delete(handle)
    }
  }

  public addOnConnected(listener: OnWsConnected): CallbackHandle {
    const handle = uuidv4()
    this.connectListeners.set(handle, listener)
    if (this.isConnected) {
      listener.call(this)
    }
    return handle
  }

  public removeOnConnected(handle: CallbackHandle) {
    if (this.connectListeners.has(handle)) {
      this.connectListeners.delete(handle)
    }
  }

  private async sleep() {
    return new Promise((res, rej) => {
      setTimeout(() => {
        res(null)
      }, this.backoffTimeMillis)
    })
  }

  identify(accessToken: string, accountId: string) {
    console.debug('Server: Sending Identify message')
    const message: ClientToServerMessage<ClientRequest> = {
      event: 'Identify',
      data: {
        accountId,
        payload: {},
      },
    }

    this.sendMessage(accessToken, message)
  }
}
