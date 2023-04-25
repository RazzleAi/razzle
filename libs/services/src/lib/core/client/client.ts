import { Md5 } from 'ts-md5'
import { WebSocket, MessageEvent, CloseEvent, ErrorEvent } from 'ws'
import { ClientLifecycle } from './client-lifecycle'
import {
  ClientHistoryItemDto,
  ClientMessageV3,
  ClientRequest,
  ClientResponse,
  ClientToEngineRequest,
  ClientToServerMessage,
  ServerMessage,
  ServerMessageV2,
  ServerToClientMessage,
} from '@razzle/dto'
import { ClientRequestValidator } from './client-request-validator'
import { User } from '../../user'
import { DateTime } from 'luxon'
import { ClientHistoryStore } from './client-history-store'
import { RazzleResponseWithActionArgs } from '@razzledotai/sdk'
import { ClientToEngineMessenger } from '../messaging'

export class Client {
  id: string
  userId?: string
  accountId?: string
  workspaceId?: string
  isIdentified = false

  constructor(
    private readonly ws: WebSocket,
    private readonly requestValidator: ClientRequestValidator,
    private readonly historyStore: ClientHistoryStore,
    private readonly clientToEngineMessenger: ClientToEngineMessenger,
    private readonly lifecycleHandler?: ClientLifecycle
  ) {
    this.generateId()
    this.ws.onmessage = this.onWsMessage.bind(this)
    this.ws.onclose = this.onWsClose.bind(this)
    this.ws.onerror = this.onWsError.bind(this)
  }

  private async onWsMessage(messageEvent: MessageEvent) {
    if ((messageEvent.data as string) === 'ping') {
      this.ws.send('pong')
      return
    }

    const message = JSON.parse(
      messageEvent.data as string
    ) as ClientToServerMessage<ClientRequest>

    const user = await this.requestValidator.validateRequest(message)
    if (!user) {
      console.error('Client: Request validation failed for message: ', message)
      return
    }

    this.handleMessageTypes(message, user)
  }

  private onWsClose(closeEvent: CloseEvent) {
    const { reason, code } = closeEvent
    console.debug(
      `Client: Closing connection to ${this.id} due to "${reason}. Code: ${code}"`
    )
    this.lifecycleHandler?.onClientClose(this, reason, code)
  }

  private onWsError(errorEvent: ErrorEvent) {
    const { error, message, type } = errorEvent
    console.error(`Client: WS Error occurred: `, { error, message, type })
    this.lifecycleHandler?.onClientError(this, error, message, type)
  }

  private generateId() {
    this.id = new Md5()
      .appendStr(new Date().getTime().toString())
      .end() as string
  }

  private listenForResponses() {
    this.clientToEngineMessenger.onResponseReceivedFromEngine(
      this.id,
      this.onResponseReceivedFromEngine.bind(this)
    )
  }

  private handleMessageTypes(
    message: ClientToServerMessage<ClientRequest>,
    user: User
  ) {
    switch (message.event) {
      case 'Identify': {
        if (!message.data) break
        const { accountId, workspaceId } = message.data
        this.handleIdentify(accountId, workspaceId, user)
        break
      }
      case 'Message': {
        if (!message.data) {
          console.error('HandleCallAction: No data in message')
          break
        }
        this.handleMessage(message.data)
        break
      }
      case 'Ping':
        this.onPing()
        break
      default:
        console.error(`Client: Unknown message type: ${message.event}`)
        break
    }
  }

  onPing() {
    if (!this.isIdentified) return
    // TODO: Determine whether to send history or not
    this.sendHistory()
  }

  private handleIdentify(accountId: string, workspaceId: string, user: User) {
    const oldId = this.id

    if (
      this.accountId !== accountId ||
      this.userId !== user.id ||
      this.workspaceId !== workspaceId
    ) {
      this.id = new Md5()
        .appendStr(user.id + workspaceId + accountId)
        .end() as string
      this.accountId = accountId
      this.workspaceId = workspaceId
      this.userId = user.id

      console.debug(`Client: Identified client ${oldId} as ${this.id}`)
      this.isIdentified = true
      this.lifecycleHandler?.onClientIdentified(oldId, this)
    }

    this.sendHistory()
    this.listenForResponses()
  }

  private async handleMessage(req: ClientRequest) {
    const request = req as ClientToEngineRequest
    if (!request.headers) {
      request.headers = {}
    }

    if (!this.id || !this.accountId || !this.workspaceId || !this.userId) {
      console.error(
        `Client: Cannot send message to engine. Client is not identified. Client: ${this.id}`
      )
      return
    }

    request.accountId = this.accountId
    request.workspaceId = this.workspaceId
    request.userId = this.userId
    request.clientId = this.id

    const { pagination } = request.payload

    if (pagination) {
      request.headers['frameId'] = pagination.frameId
      request.headers['pageNumber'] = pagination.pageNumber
      request.headers['pageSize'] = pagination.pageSize
    }

    const historyItem: ClientHistoryItemDto = {
      hash: new Md5().appendStr(JSON.stringify(request)).end() as string,
      isFramed: !!pagination,
      message: {
        __objType__: 'ClientMessageV3',
        frameId: pagination?.frameId,
        type: 'Message',
        data: request,
      } as ClientMessageV3,
      timestampMillis: DateTime.now().toUnixInteger() * 1000,
    }

    this.maybeNotifyFirstActionTriggered()

    if (!historyItem.isFramed) {
      await this.addToHistory(historyItem)
      this.sendHistory()
    }

    this.clientToEngineMessenger.sendRequestToEngine(request)
  }

  async onResponseReceivedFromEngine(response: ClientResponse) {
    const historyItem: ClientHistoryItemDto = {
      hash: new Md5().appendStr(JSON.stringify(response)).end() as string,
      isFramed: !!response.payload.pagination?.frameId,
      message: {
        __objType__: 'ServerMessageV2',
        type: 'NewMessage',
        frameId: response.payload.pagination?.frameId,
        data: response,
      } as ServerMessageV2,
      timestampMillis: DateTime.now().toUnixInteger() * 1000,
    }
    // if not framed, add to history and send
    if (!historyItem.isFramed) {
      await this.addToHistory(historyItem)
      this.sendHistory()
    } else if (
      historyItem.isFramed &&
      response.payload.pagination &&
      response.payload.pagination?.frameId &&
      this.workspaceId
    ) {
      // if framed, do not simply add to history, check history for message with same frame id and replace it
      const frameId = response.payload.pagination.frameId
      const existingItem =
        await this.getFramedServerMessageHistoryItemWithFrameId(frameId)
      if (existingItem) {
        // preserve timestamp
        historyItem.timestampMillis = existingItem.timestampMillis
        await this.historyStore.replaceHistoryItem(
          this.id,
          this.workspaceId,
          existingItem,
          historyItem
        )
      } else {
        await this.addToHistory(historyItem)
      }
      this.sendHistory()
    }
  }

  async sendHistory() {
    const history = await this.getHistory(10)
    const historyResponse: ServerToClientMessage<ClientHistoryItemDto[]> = {
      event: 'History',
      data: history,
    }
    this.ws.send(JSON.stringify(historyResponse))
  }

  async addToHistory(historyItem: ClientHistoryItemDto) {
    if (!this.isIdentified || !this.workspaceId) return
    await this.historyStore.addToHistoryForClient(
      this.id,
      this.workspaceId,
      historyItem
    )
  }

  getHistory(tail: number): Promise<ClientHistoryItemDto[]> {
    if (!this.isIdentified || !this.workspaceId) return Promise.resolve([])
    return this.historyStore.getHistoryForClient(
      this.id,
      this.workspaceId,
      tail
    )
  }

  private async getFramedServerMessageHistoryItemWithFrameId(
    frameId: string
  ): Promise<ClientHistoryItemDto | undefined> {
    if (!this.isIdentified || !this.workspaceId) return undefined
    const allFramedItems =
      await this.historyStore.getFramedHistoryItemsForClient(
        this.id,
        this.workspaceId
      )
    const matchingItem = allFramedItems.find((item: ClientHistoryItemDto) => {
      const message = item.message
      if (message.__objType__ === 'ClientMessage') return false
      let response: RazzleResponseWithActionArgs | undefined
      if (message.__objType__ === 'ServerMessage') {
        const serverMessage = message as ServerMessage
        response = serverMessage.data.message as RazzleResponseWithActionArgs
      } else if (message.__objType__ === 'ServerMessageV2') {
        const serverMessage = message as ServerMessageV2
        response = serverMessage.data.payload as RazzleResponseWithActionArgs
      }

      if (!response || !response.pagination) return false
      return response.pagination.frameId === frameId
    })

    return matchingItem
  }

  private async maybeNotifyFirstActionTriggered() {
    // TODO
  }
}
