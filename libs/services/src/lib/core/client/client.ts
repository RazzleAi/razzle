import { Md5 } from 'ts-md5'
import { WebSocket, MessageEvent, CloseEvent, ErrorEvent } from 'ws'
import { ClientLifecycle } from './client-lifecycle'
import {
  ClientHistoryItemDto,
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
import { ChatHistoryItem } from '../enginev2/chat/chathistoryitem'
import { ChatService } from '../enginev2/chat/chat.service'
import Chat from '../enginev2/chat/chat'

export class Client {
  id: string
  userId?: string
  accountId?: string
  workspaceId?: string
  isIdentified = false
  currentChat: Chat | undefined

  constructor(
    private readonly ws: WebSocket,
    private readonly requestValidator: ClientRequestValidator,
    private readonly historyStore: ClientHistoryStore,
    private readonly clientToEngineMessenger: ClientToEngineMessenger,
    private readonly chatService: ChatService,
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

    await this.handleMessageTypes(message, user)
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

  private async handleMessageTypes(
    message: ClientToServerMessage<any>,
    user: User
  ) {
    switch (message.event) {
      case 'Identify': {
        if (!message.data) break
        const { accountId, workspaceId } = message.data
        await this.handleIdentify(accountId, workspaceId, user)
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
      case 'CreateNewChat':
        if (!this.accountId || !this.userId || !this.workspaceId) {
          console.error(
            'Client: Cannot create new chat, client is not identified'
          )
          break
        }

        this.chatService.createNewChat(
          this.accountId,
          this.userId,
          this.workspaceId,
          this.id,
          message.data
        )

        break

      case 'NewChatSelected':
        this.onNewChatSelected(message.data as string)
        break

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
    this.sendHistory()
  }

  private async onNewChatSelected(chatId: string) {
    const chat = await this.chatService.getChat(chatId)
    if (!chat) {
      console.error(`Client: Chat ${chatId} not found`)
      return
    }

    this.currentChat = chat
  }

  private async handleIdentify(
    accountId: string,
    workspaceId: string,
    user: User
  ) {
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

    const currentChatsForUser = await this.chatService.getChatsForUser(
      this.userId
    )

    if (currentChatsForUser.length === 0) {
      console.log('Client: No chats found for user, creating new chat')
      const createdChat = await this.chatService.createNewChat(
        this.accountId,
        this.userId,
        this.workspaceId,
        this.id,
        'ChatGpt-3.5'
      )

      console.log('Client: Created new chat: ', createdChat.chatId)
      this.currentChat = createdChat
    } else {
      console.log(currentChatsForUser)
      console.log(
        `Found ${currentChatsForUser.length} chats for user ${user.id} using chat ${currentChatsForUser[0].chatId} as current chat`
      )
      this.currentChat = currentChatsForUser[0]
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

    console.log(`Current chatId: ${this.currentChat?.chatId}`)

    if (!request.payload.prompt) {
      console.log(
        'Client: No prompt in request. ChatId: ',
        this.currentChat?.chatId
      )
      return
    }

    if (!this.currentChat) {
      console.error(
        `Client: Cannot send message to engine. No current chat. Client: ${this.id}`
      )
      return
    }

    try {
      const acceptance = await this.currentChat.accept(request.payload.prompt)
      this.chatService.saveChat(this.currentChat)

      let nextResponse = await acceptance.next()
      while (!nextResponse.done) {
        await this.sendHistory()
        await this.chatService.saveToChatHistory(
          this.currentChat.chatId,
          nextResponse.value as ChatHistoryItem
        )

        nextResponse = await acceptance.next()
      }

      this.sendHistory()
    } catch (e) {
      console.error('Client: Error accepting prompt: ', e)
    }

    this.maybeNotifyFirstActionTriggered()
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
    if (!this.currentChat?.chatId) return

    const historyResponse: ServerToClientMessage<ChatHistoryItem[]> = {
      event: 'History',
      data: this.currentChat?.history || [],
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
