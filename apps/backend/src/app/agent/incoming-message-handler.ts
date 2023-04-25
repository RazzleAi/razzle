// import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common'
// import { AppsServiceImpl } from '../apps/apps.service-impl'
// import { AgentWebSocket, IncomingMessageHandler } from './agent-web-socket'
// import { AgentHeaderValidator } from './header-validator'
// import {
//   AgentRequest,
//   AgentResponse,
//   AgentSyncDto,
//   AgentSyncDtoValidator,
//   AgentToServerMessage,
//   ServerToAgentMessage,
// } from '@razzle/dto'
// import UserAppAuthenticationHandlerImpl from '../apps/user-app-authentication-message-handler'
// import { RazzleLink, RazzleText } from '@razzledotai/widgets'
// import { RazzleResponse } from '@razzledotai/sdk'
// import { KafkaClient } from '../kafka/kafka-client'
// import { Producer } from 'kafkajs'
// import AgentFuncResponseHandler from './agent-func-response-handler'

// @Injectable()
// export class IncomingMessageHandlerImpl
//   implements IncomingMessageHandler, OnModuleDestroy
// {
//   private logger = new Logger(IncomingMessageHandlerImpl.name)
//   private kafkaProducer: Producer

//   constructor(
//     private readonly headerValidator: AgentHeaderValidator,
//     private readonly appService: AppsServiceImpl,
//     private readonly userAppAuthenticationHandlerImpl: UserAppAuthenticationHandlerImpl,
//     private readonly kafkaClient: KafkaClient,
//     private readonly agentFuncResponseHandler: AgentFuncResponseHandler,
//   ) {
//     this.kafkaProducer = this.kafkaClient.producer({idempotent: true})
//     this.kafkaProducer.connect()
//   }

//   async onModuleDestroy() {
//     await this.kafkaProducer.disconnect()
//   }

//   canActivate(headers: NodeJS.Dict<string | string[]>): Promise<boolean> {
//     return this.headerValidator.validateHeaders(headers)
//   }

//   async handleMessage(
//     agent: AgentWebSocket,
//     message: AgentToServerMessage<AgentRequest>
//   ): Promise<ServerToAgentMessage<AgentResponse> | void> {
//     switch (message.event) {
//       case 'SyncApp': {
//         const res = await this.handleAgentSync(agent, message.data.payload)
//         return {
//           event: 'SyncAppResponse',
//           data: {
//             headers: message.data.headers,
//             payload: res,
//           },
//         }
//       }

//       case 'FuncResponse': {
//         return await this.handleFuncResponse(message)
//       }

//       case 'AuthenticateResponse': {
//         return await this.handleAuthenticationResponse(message)
//       }

//       case 'UserAppAuthentication': {
//         return await this.handleUserAppAuthentication(message)
//       }
//     }
//   }

//   async handleAgentSync(
//     agent: AgentWebSocket,
//     payload: any
//   ): Promise<{ [key: string]: any }> {
//     const { valid, error } = await this.validateSyncPayload(payload)
//     if (!valid) {
//       return {
//         success: false,
//         error: error,
//       }
//     }

//     try {
//       await this.appService.syncApp(agent.app.appId, payload as AgentSyncDto)
//     } catch (e) {
//       this.logger.error(e)
//       return {
//         success: false,
//         error: e,
//       }
//     }
//     return {
//       success: true,
//     }
//   }

//   private async validateSyncPayload(
//     payload: any
//   ): Promise<{ valid: boolean; error?: string }> {
//     const validator = new AgentSyncDtoValidator()
//     return validator.validateData(payload)
//   }

//   private async handleFuncResponse(
//     message: AgentToServerMessage<AgentRequest>
//   ): Promise<void> {
//     this.agentFuncResponseHandler.handleResponse(message)
//   }

//   private async sendMessageToClientByClientId(
//     clientId: string,
//     appId: string,
//     message: any
//   ) {
//     this.logger.debug('Sending message to client: ', clientId, appId)
//     const payload = { clientId, appId, message }
//     await this.kafkaProducer.send({
//       topic: clientId,
//       acks: -1,
//       messages: [
//         {
//           value: JSON.stringify(payload),
//         },
//       ],
//     })
//   }

//   private async sendMessageToClientByUserId( //TODO: fix this
//     userId: string,
//     appId: string,
//     message: any
//   ) {
//     const payload = { userId, appId, message }
//     await this.kafkaProducer.send({
//       topic: userId,
//       messages: [
//         {
//           value: JSON.stringify(payload),
//         },
//       ],
//     })
//   }

//   async handleAuthenticationResponse(
//     message: AgentToServerMessage<AgentRequest>
//   ) {
//     const { clientId, appId, userId, url } = message.data.payload
//     this.logger.debug('Authentication Response: ', clientId, appId, userId)

//     // send the payload to redis
//     // this.nodeResolver.sendMessageToClientByClientId(clientId, appId, message)
//     this.sendMessageToClientByUserId(userId, appId, {
//       event: 'FuncResponse',
//       data: {
//         payload: new RazzleResponse({
//           ui: new RazzleLink({
//             action: {
//               type: 'URL',
//               label: 'Login to Continue',
//               action: url,
//             },
//           })
//         })
//       },
//     })
//   }

//   async handleUserAppAuthentication(
//     message: AgentToServerMessage<AgentRequest>
//   ) {
//     const { appId, userId } = message.data.payload
//     this.logger.debug(
//       'UserAppAuthentication Response. UserID: ',
//       userId,
//       'AppID: ',
//       appId
//     )

//     this.userAppAuthenticationHandlerImpl.handleUserAppAuthenticationUpdate(
//       userId,
//       appId
//     )

//     const actionResponse = new RazzleResponse({
//       ui: new RazzleText({ text: `User authentication successful` }),
//     })

//     this.sendMessageToClientByUserId(userId, appId, {
//       event: 'FuncResponse',
//       data: {
//         payload: {
//           ui: actionResponse.ui,
//         },
//       },
//     })
//   }
// }
