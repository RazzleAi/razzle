import { WebSocket, RawData } from 'ws'
import { MessageHandler } from './message-handler'
import { ServerRequest } from './types'
import Logger from './util/logger'

export class RazzleServer {
  private wsClient: WebSocket
  private onConnect: () => void
  private backoffTime = 2000
  private pingInterval: NodeJS.Timeout
  private logger: Logger

  constructor(
    private readonly appId: string,
    private readonly apiKey: string,
    private readonly messageHandler: MessageHandler,
    onConnect?: () => void
  ) {
    this.logger = Logger.getInstance()
    this.onConnect = onConnect
    this.connect()
  }

  public get isConnected() {
    return this.wsClient.readyState === WebSocket.OPEN
  }

  private connect() {
    const wsUrl = process.env.RAZZLE_WS_URL || 'wss://api.razzle.ai/agent'

    this.wsClient = new WebSocket(wsUrl, {
      headers: { api_key: this.apiKey, app_id: this.appId },
    })
    this.wsClient.on('open', this.onWsOpen.bind(this))
    this.wsClient.on('message', this.onWsMessage.bind(this))
    this.wsClient.on('close', this.onWsClose.bind(this))
    this.wsClient.on('error', this.onWsError.bind(this))
  }

  public async send(message: ServerRequest): Promise<void> {
    if (!this.isConnected) {
      this.logger.debug('IS NOT CONNECTED')
      return
    }

    // make sure app id and api key are set
    if (!message.data.headers) {
      message.data.headers = {}
    }
    message.data.headers['app_id'] = this.appId
    message.data.headers['api_key'] = this.apiKey
    const messageJson = JSON.stringify(message)

    // this.logger.debug('RazzleServer.send: Payload: \n', messageJson)
    return new Promise((resolve, reject) => {
      this.wsClient.send(messageJson, (optionalErr?: Error) => {
        if (optionalErr) {
          console.error('Failed to send message to server:', optionalErr)
          reject(optionalErr)
        } else {
          resolve()
        }
      })
    })
  }

  private sendPing() {
    if (!this.isConnected) {
      return
    }
    this.wsClient.ping('ping')
  }

  private onWsOpen(ws: WebSocket) {
    setTimeout(() => {
      this.onConnect.call(this)
    }, 1000)
    this.pingInterval = setInterval(() => {
      this.sendPing()
    }, 10000)
  }

  private async onWsClose(code: number, reason: Buffer) {
    this.logger.debug(
      `Connection closed. Code: ${code}. Reason: ${reason.toString()}`
    )
    // periodically try to connect
    await this.retryConnect()
  }

  private onWsError(ws: any, err: any) {
    const { errno, code, message } = ws
    this.logger.debug(
      `Failed to connect to razzle server. Message: ${message}. Errno: ${errno}. Code: ${code}`
    )
  }

  private async onWsMessage(data: RawData, isBinary: boolean) {
    if (isBinary) {
      this.logger.log(
        'RazzleServer.onMessage: Cannot handle binary messages',
        data && data.toString()
      )
      return
    }

    const response = await this.messageHandler.handleMessage(data)
    if (response) {
      await this.send(response)
    }
  }

  private async retryConnect() {
    await this.sleep()
    this.logger.log('Razzle Server: Retrying...')
    this.backoffTime *= 1.2
    this.connect()
  }

  private async sleep() {
    return new Promise((res, rej) => {
      setTimeout(() => {
        res(null)
      }, this.backoffTime)
    })
  }
}
