// import { App } from '@prisma/client'
// import { WebSocket, MessageEvent, CloseEvent, ErrorEvent } from 'ws'
// import { Md5 } from 'ts-md5'
// import { Logger } from '@nestjs/common'
// import {
//   AgentRequest,
//   AgentResponse,
//   AgentToServerMessage,
//   ServerToAgentMessage,
// } from '@razzle/dto'
// import { AgentBoundMessageSubscriber } from './agent-bound-message-subscriber'
// import { Agent } from '@razzle/services'

// export interface IncomingMessageHandler {
//   canActivate(headers: NodeJS.Dict<string | string[]>): Promise<boolean>
//   handleMessage(
//     agent: AgentWebSocket,
//     message: AgentToServerMessage<AgentRequest>
//   ): Promise<ServerToAgentMessage<AgentResponse> | void>
// }

// export interface AgentLifecycleHandler {
//   onClose(agent: AgentWebSocket, reason: string, code: number)
//   onError(agent: AgentWebSocket, error: any, message: string, type: string)
// }

// export class AgentWebSocket {
//   private logger = new Logger(AgentWebSocket.name)

//   id: string

//   constructor(
//     private readonly ws: WebSocket,
//     readonly app: App,
//     private readonly lifecycleHandler: AgentLifecycleHandler,
//     private readonly incomingMessageHandler: IncomingMessageHandler,
//     private readonly agentBoundMessageSubscriber: AgentBoundMessageSubscriber
//   ) {
//     this.id = new Md5()
//       .appendStr(new Date().getTime().toString())
//       .end()
//       .toString()
//     this.logger.debug(`Agent connected with id ${this.id}`)

//     this.ws.onmessage = this.onWsMessage.bind(this)
//     this.ws.onclose = this.onWsClose.bind(this)
//     this.ws.onerror = this.onWsError.bind(this)
//     this.ws.on('ping', () => {
//       this.ws.pong('pong')
//     })

//     this.agentBoundMessageSubscriber.listenForAgentBoundMessages(this.app.appId)
//   }

//   private async onWsMessage(messageEvent: MessageEvent) {
//     const { data, type } = messageEvent
//     // this.logger.debug('Agent: Received event from agent: ', { data, type })

//     const message = JSON.parse(
//       messageEvent.data.toString()
//     ) as AgentToServerMessage<AgentRequest>

//     // TODO: validate request
//     const payload = message.data!
//     let isValid = true
//     if (!payload.headers) {
//       isValid = false
//     } else {
//       if (this.incomingMessageHandler) {
//         isValid = await this.incomingMessageHandler.canActivate(payload.headers)
//       }
//     }

//     if (!isValid) {
//       // ignore unauthorized messages
//       this.logger.debug(
//         'Agent: Unauthorized message. Missing app_id or api_key headers'
//       )
//       return
//     }

//     const response = await this.incomingMessageHandler?.handleMessage(
//       this,
//       message
//     )
//     if (response) {
//       this.sendMessage(response)
//     }
//   }

//   private onWsClose(closeEvent: CloseEvent) {
//     const { reason, code } = closeEvent
//     this.logger.debug(
//       `Agent: Closing connection to ${this.id} due to "${reason}. Code: ${code}"`
//     )
//     this.lifecycleHandler?.onClose(this, reason, code)
//   }

//   private onWsError(errorEvent: ErrorEvent) {
//     const { error, message, type } = errorEvent
//     this.logger.error(`Agent: WS Error occurred: `, { error, message, type })
//     this.lifecycleHandler?.onError(this, error, message, type)
//   }

//   public sendMessage(message: ServerToAgentMessage<AgentResponse>) {
//     this.ws.send(JSON.stringify(message))
//   }

// }
