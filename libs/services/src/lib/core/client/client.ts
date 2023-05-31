import { Md5 } from 'ts-md5'
import { WebSocket, MessageEvent, CloseEvent, ErrorEvent } from 'ws'
import { ClientLifecycle } from './client-lifecycle'
import {
  AvailableChatLlms,
  ClientHistoryItemDto,
  ClientRequest,
  ClientResponse,
  ClientToEngineRequest,
  ClientToServerMessage,
  CreateNewChatDto,
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
import Chat from '../enginev2/chat/chat'
import { IAgent } from '../enginev2/agent/agent'
import { ChatGpt, ChatTunedLlm, NlpProxyAgent } from '../enginev2'
import { ChatHistoryItem } from '../enginev2/chat/chathistoryitem'
import { AccountService } from '../../account'
import { PromptResolverService } from '../../ml'
import { AgentCaller } from '../agent'
import { Sequencer } from '../engine/sequencer'

export class Client {
  id: string
  userId?: string
  accountId?: string
  workspaceId?: string
  isIdentified = false
  chats: Chat[] = []
  currentChatId: string | undefined

  constructor(
    private readonly ws: WebSocket,
    private readonly requestValidator: ClientRequestValidator,
    private readonly historyStore: ClientHistoryStore,
    private readonly clientToEngineMessenger: ClientToEngineMessenger,
    private readonly accountService: AccountService,
    private readonly agentCaller: AgentCaller,
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
        this.createNewChat(message.data as CreateNewChatDto)
        break

      case 'NewChatSelected':
        this.currentChatId = message.data as string
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

  private async createNewChat(dto: CreateNewChatDto) {
    if (!this.accountId) {
      console.error('Client: No account id, cannot create new chat')
      return
    }

    console.log('Client: Creating new chat')

    const allApps = await this.accountService.getAppsInAccount(this.accountId)
    const promptResolver = new PromptResolverService()
    const sequencer = new Sequencer(this.agentCaller, promptResolver)

    const agents = allApps.map(
      (app) => new NlpProxyAgent(app, promptResolver, sequencer)
    )

    const chat = new Chat({
      accountId: this.accountId ?? '',
      workspaceId: this.workspaceId ?? '',
      userId: this.userId ?? '',
      agents,
      clientId: this.id,
      llm: this.getLLm(dto.llm, agents),
    })

    this.chats.push(chat)
    return chat
  }

  private getChat(chatId: string): Chat | undefined {
    return this.chats.find((c) => c.chatId === chatId)
  }

  private getLLm(name: AvailableChatLlms, agents: IAgent[]): ChatTunedLlm {
    switch (name) {
      case 'ChatGpt-3.5':
        return ChatGpt.create(agents)

      default:
        return ChatGpt.create(agents)
    }
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

    if (this.chats.length === 0) {
      await this.createNewChat({ llm: 'ChatGpt-3.5' })
      this.currentChatId = this.chats[0].chatId
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

    const chat = this.getChat(this.currentChatId ?? '')

    if (!chat) {
      console.log('Client: No chat found for chatId: ', this.currentChatId)
      return
    }

    if (!request.payload.prompt) {
      console.log('Client: No prompt in request. ChatId: ', chat.chatId)
      return
    }

    try {
      const acceptance = await chat.accept(request.payload.prompt)

      let nextResponse = await acceptance.next()
      while (!nextResponse.done) {
        console.log(nextResponse)
        this.sendHistory()
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
    if (!this.currentChatId) return

    const currentChat = this.getChat(this.currentChatId)
    const historyResponse: ServerToClientMessage<ChatHistoryItem[]> = {
      event: 'History',
      data: currentChat?.history || [],
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
