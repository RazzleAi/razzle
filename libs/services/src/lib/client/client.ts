// import { User } from '@prisma/client'
// import {
//   AgentToServerMessage,
//   ClientHistoryItemDto,
//   ClientMessage,
//   ClientRequest,
//   ClientToServerMessage,
//   ServerMessage,
//   AuthenticationMessage,
//   ServerToClientMessage,
//   AgentRequest,
//   StepDto,
//   ClientMessageV2,
// } from '@razzle/dto'
// import { RazzleResponse, RazzleResponseWithActionArgs } from '@razzledotai/sdk'
// import { RazzleWidgetType } from '@razzledotai/widgets'
// import { DateTime } from 'luxon'
// import { Md5 } from 'ts-md5'
// import { WebSocket, MessageEvent, CloseEvent, ErrorEvent } from 'ws'
// import { OnboardingService } from '../onboarding'
// import { ClientHistoryStore } from './client-history-store'
// import { ClientRequestValidator } from './client-request-validator'
// import { WorkspaceService } from '../workspace'
// import { PromptAndSteps } from '../ml'

// export interface IncomingMessageHandler {
//   handleMessageFromClient(
//     workspaceId: string,
//     client: Client,
//     message: ClientToServerMessage<ClientRequest>
//   ): any

//   handleCallActionEvent(
//     workspaceId: string,
//     client: Client,
//     promptSteps: PromptAndSteps,
//     headers: NodeJS.Dict<string | any>
//   ): void
// }

// export interface ClientLifecycleHandler {
//   onClose(client: Client, reason: string, code: number): any
//   onError(client: Client, error: any, message: string, type: string): any
//   onIdentified(oldId: string, client: Client): void
// }

// export interface ClientBoundMessageListener {
//   listenForClientBoundMessages(clientId: string): void
// }

// export class Client {
//   private md5 = new Md5()
//   id: string
//   isIdentified = false
//   authUid: string
//   user?: User
//   workspaceId: string
//   accountId: string
//   hasTriggeredAction = false

//   constructor(
//     private readonly ws: WebSocket,
//     private readonly clientRequestValidator: ClientRequestValidator,
//     private readonly clientHistoryStore: ClientHistoryStore,
//     private readonly lifecycleHandler: ClientLifecycleHandler,
//     private readonly incomingMessageHandler: IncomingMessageHandler,
//     private readonly clientBoundMessageListener: ClientBoundMessageListener,
//     private readonly onboardingService: OnboardingService,
//     private readonly workspaceService: WorkspaceService
//   ) {
//     this.id = new Md5()
//       .appendStr(new Date().getTime().toString())
//       .end() as string

//     this.ws.onmessage = this.onWsMessage.bind(this)
//     this.ws.onclose = this.onWsClose.bind(this)
//     this.ws.onerror = this.onWsError.bind(this)
//   }

//   onPing() {
//     if (!this.isIdentified) return

//     this.sendHistory()
//   }

//   async sendHistory() {
//     const history = await this.getHistory(10)
//     const historyResponse: ServerToClientMessage<ClientHistoryItemDto[]> = {
//       event: 'History',
//       data: history,
//     }
//     this.ws.send(JSON.stringify(historyResponse))
//   }

//   async addToHistory(historyItem: ClientHistoryItemDto) {
//     if (!this.isIdentified) return
//     await this.clientHistoryStore.addToHistoryForClient(
//       this.id,
//       this.workspaceId,
//       historyItem
//     )
//   }

//   getHistory(tail: number): Promise<ClientHistoryItemDto[]> {
//     return this.clientHistoryStore.getHistoryForClient(
//       this.id,
//       this.workspaceId,
//       tail
//     )
//   }

//   async getFramedServerMessageHistoryItemWithFrameId(
//     frameId: string
//   ): Promise<ClientHistoryItemDto | undefined> {
//     const allFramedItems =
//       await this.clientHistoryStore.getFramedHistoryItemsForClient(
//         this.id,
//         this.workspaceId
//       )
//     const matchingItem = allFramedItems.find((item: ClientHistoryItemDto) => {
//       const message = item.message
//       if (message.__objType__ === 'ClientMessage') return false
//       const serverMessage = message as ServerMessage
//       const response = serverMessage.data
//         .message as RazzleResponseWithActionArgs
//       if (!response || !response.pagination) return false
//       return response.pagination.frameId === frameId
//     })

//     return matchingItem
//   }

//   private async onWsMessage(messageEvent: MessageEvent) {
//     if ((messageEvent.data as string) === 'ping') {
//       this.ws.send('pong')
//       return
//     }

//     const message = JSON.parse(
//       messageEvent.data as string
//     ) as ClientToServerMessage<ClientRequest>

//     const user = await this.clientRequestValidator.validateRequest(message)
//     if (!user) {
//       // drop the request, in the future, we might want to disconnect the client
//       console.error('Invalid request: ', message)
//       return
//     }

//     switch (message.event) {
//       case 'Identify': {
//         if (!message.data) break
//         const { workspaceId, accountId } = message.data.payload
//         this.handleIdentify(user, workspaceId, accountId)
//         break
//       }

//       case 'CallAction':
//         if (!this.isIdentified) break

//         this.handleCallAction(message)
//         break

//       case 'Message':
//         this.handleMessage(message)
//         break

//       case 'Ping':
//         this.onPing()
//         break

//       default:
//         break
//     }
//   }

//   private async handleIdentify(
//     user: User,
//     workspaceId: string,
//     accountId: string
//   ) {
//     const oldId = this.id

//     // if workspaceId or accountId changes, regenerate id
//     if (
//       this.workspaceId !== workspaceId ||
//       this.accountId !== accountId ||
//       this.authUid !== user.authUid
//     ) {
//       this.authUid = user.authUid
//       this.workspaceId = workspaceId
//       this.accountId = accountId

//       this.id = new Md5()
//         .appendStr(user.authUid + workspaceId + accountId)
//         .end() as string
//       console.debug('Identified client: ', this.id)
//       this.isIdentified = true
//       this.lifecycleHandler.onIdentified(oldId, this)
//       this.user = user
//     }

//     this.sendHistory()
//     this.clientBoundMessageListener.listenForClientBoundMessages(this.id)
//   }

//   private async handleCallAction(
//     message: ClientToServerMessage<ClientRequest>
//   ) {
//     if (!message.data) {
//       console.error('HandleCallAction: No data in message')
//       return
//     }

//     if (!message.data.headers) {
//       message.data.headers = {}
//     }
//     message.data.headers['clientId'] = this.id
//     message.data.headers['workspaceId'] = this.workspaceId

//     const { prompt, steps, pagination } = message.data.payload

//     if (pagination) {
//       message.data.headers['frameId'] = pagination.frameId
//       message.data.headers['pageNumber'] = pagination.pageNumber
//       message.data.headers['pageSize'] = pagination.pageSize
//     }

//     this.incomingMessageHandler.handleMessageFromClient(
//       this.workspaceId,
//       this,
//       message
//     )

//     // add message to history
//     const historyItem: ClientHistoryItemDto = {
//       hash: this.md5.appendStr(JSON.stringify(message)).end() as string,
//       isFramed: !!pagination,
//       message: {
//         __objType__: 'ClientMessage',
//         type: 'CallAction',
//         frameId: pagination?.frameId,
//         data: (steps as StepDto[]).map((step) => ({
//           action: step.actionName,
//           prompt: prompt,
//           appId: step.appId,
//           args: step.actionInput.map((arg) => ({
//             arg: arg.name,
//             value: arg.value,
//           })),
//         })),
//       } as ClientMessage,
//       timestampMillis: DateTime.now().toUnixInteger() * 1000,
//     }

//     if (!this.hasTriggeredAction) {
//       const cnt = await this.clientHistoryStore.countAllByWorkspaceId(
//         this.workspaceId
//       )
//       if (cnt === 0) {
//         this.onboardingService
//           .updateOnboardingByAccountId(this.accountId, {
//             firstActionTriggered: true,
//           })
//           .then(() => {
//             this.hasTriggeredAction = true
//           })
//       }
//     }

//     if (!historyItem.isFramed) {
//       await this.addToHistory(historyItem)
//       this.sendHistory()
//     }
//   }

//   async handleMessage(message: ClientToServerMessage<ClientRequest>) {
//     const hash = this.md5.appendStr(JSON.stringify(message)).end() as string

//     if (!message.data) {
//       console.error('HandleCallAction: No data in message')
//       return
//     }

//     if (!message.data.headers) {
//       message.data.headers = {}
//     }
//     message.data.headers['clientId'] = this.id
//     message.data.headers['workspaceId'] = this.workspaceId

//     const { pagination } = message.data.payload

//     if (pagination) {
//       message.data.headers['frameId'] = pagination.frameId
//       message.data.headers['pageNumber'] = pagination.pageNumber
//       message.data.headers['pageSize'] = pagination.pageSize
//     }

//     const historyItem: ClientHistoryItemDto = {
//       hash: this.md5.appendStr(JSON.stringify(message)).end() as string,
//       message: {
//         __objType__: 'ClientMessageV2',
//         type: 'Message',
//         data: message.data?.payload as string,
//       } as ClientMessageV2,
//       timestampMillis: DateTime.now().toUnixInteger() * 1000,
//     }

//     this.maybeNotifyFirstActionTriggered()

//     const steps = await this.workspaceService.handleMessage(
//       this.workspaceId,
//       message.data?.payload as string
//     )

//     this.incomingMessageHandler.handleCallActionEvent(
//       this.workspaceId,
//       this,
//       {
//         prompt: message.data?.payload as string,
//         steps: steps,
//       },
//       message.data?.headers ?? {}
//     )

//     if (!historyItem.isFramed) {
//       await this.addToHistory(historyItem)
//       this.sendHistory()
//     }
//   }

//   async maybeNotifyFirstActionTriggered() {
//     if (!this.hasTriggeredAction) {
//       const cnt = await this.clientHistoryStore.countAllByWorkspaceId(
//         this.workspaceId
//       )
//       if (cnt === 0) {
//         this.onboardingService
//           .updateOnboardingByAccountId(this.accountId, {
//             firstActionTriggered: true,
//           })
//           .then(() => {
//             this.hasTriggeredAction = true
//           })
//       }
//     }
//   }

//   handleAuthenticationResponse(response: AgentToServerMessage<AgentRequest>) {
//     if (!response.data) {
//       console.error('handleAuthenticationResponse: No data in response')
//       return
//     }

//     const authResponse: ServerToClientMessage<AuthenticationMessage> = {
//       event: 'AuthenticationResponse',
//       data: {
//         __objType__: 'AuthenticationResponseMessage',
//         ...response.data.payload,
//       } as AuthenticationMessage,
//     }
//     this.ws.send(JSON.stringify(authResponse))
//   }

//   async handleCallActionResponse(
//     data: AgentToServerMessage<{
//       appId: string
//       applicationId: string
//       appName: string
//       appDescription: string
//       message: RazzleResponse | RazzleResponseWithActionArgs
//     }>
//   ) {
//     const { appId, appName, applicationId, appDescription, message } =
//       data.data!

//     if (!this.validateMessage(message)) {
//       return
//     }

//     const historyItem: ClientHistoryItemDto = {
//       hash: this.md5.appendStr(JSON.stringify(data)).end() as string,
//       isFramed: !!message.pagination?.frameId,
//       message: {
//         __objType__: 'ServerMessage',
//         type: 'NewMessage',
//         frameId: message.pagination?.frameId,
//         data: { appId, appName, applicationId, appDescription, message },
//       } as ServerMessage,
//       timestampMillis: DateTime.now().toUnixInteger() * 1000,
//     }

//     // if not framed, add to history and send
//     if (!historyItem.isFramed) {
//       await this.addToHistory(historyItem)
//       this.sendHistory()
//     } else if (
//       historyItem.isFramed &&
//       message.pagination &&
//       message.pagination?.frameId
//     ) {
//       // if framed, do not simply add to history, check history for message with same frame id and replace it
//       const frameId = message.pagination.frameId
//       const existingItem =
//         await this.getFramedServerMessageHistoryItemWithFrameId(frameId)
//       if (existingItem) {
//         // preserve timestamp
//         historyItem.timestampMillis = existingItem.timestampMillis
//         await this.clientHistoryStore.replaceHistoryItem(
//           this.id,
//           this.workspaceId,
//           existingItem,
//           historyItem
//         )
//       } else {
//         await this.addToHistory(historyItem)
//       }
//       this.sendHistory()
//     }
//   }

//   private onWsClose(closeEvent: CloseEvent) {
//     const { reason, code } = closeEvent
//     console.debug(
//       `Client: Closing connection to ${this.id} due to "${reason}. Code: ${code}"`
//     )
//     this.lifecycleHandler?.onClose(this, reason, code)
//   }

//   private onWsError(errorEvent: ErrorEvent) {
//     const { error, message, type } = errorEvent
//     console.error(`Client: WS Error occurred: `, { error, message, type })
//     this.lifecycleHandler?.onError(this, error, message, type)
//   }

//   private validateMessage(message: any): boolean {
//     if (!message) {
//       return false
//     }

//     if (!('ui' in message)) {
//       return false
//     }

//     const ui = message.ui
//     if (typeof ui !== 'object') {
//       return false
//     }

//     const type = ui.type as RazzleWidgetType
//     if (!type) {
//       return false
//     }

//     return true
//   }
// }
