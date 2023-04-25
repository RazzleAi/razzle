// import { Injectable, Logger } from '@nestjs/common'
// import {
//   ActionPlanWithDetailsDto,
//   ClientRequest,
//   ClientToServerEvent,
//   ClientToServerMessage,
//   StepDto,
// } from '@razzle/dto'
// import { AppsServiceImpl } from '../apps/apps.service-impl'
// import { UserAppAuthenticationRepoImpl } from '../apps/user-app-authentication.repo'
// import { ConnectedAgentManager } from './connected-agent-manager'

// @Injectable()
// export class AgentBoundMessageHandler {
//   private logger = new Logger(AgentBoundMessageHandler.name)

//   constructor(
//     private readonly appsService: AppsServiceImpl,
//     private readonly userAppAuthRepo: UserAppAuthenticationRepoImpl,
//     private readonly connectedAgentManager: ConnectedAgentManager
//   ) {}

//   async handleAgentBoundMessage(message: string) {
//     console.debug('RECEIVED BROADCAST MESSAGE FROM CLIENT', message)
//     const wsMessage = JSON.parse(
//       message
//     ) as ClientToServerMessage<ClientRequest>
//     const { event, data } = wsMessage
//     const { headers, payload } = data

//     // find an agent for the app ID this message is destined for and relay the message to that agent

//     if ((event as ClientToServerEvent) === 'CallAction') {
//       const userId = headers['userId']
//       const appId = payload.appId

//       const userAuthenticated = await this.userAuthenticated(userId, appId)

//       const agent = this.connectedAgentManager.getAgentForAppId(appId)
//       const data = { headers, payload }

//       if (userAuthenticated) {
//         agent.sendMessage({
//           event: 'CallFunction',
//           data,
//         })
//       } else {
//         agent.sendMessage({
//           event: 'Authenticate',
//           data,
//         })
//       }
//     }
//   }

//   private async userAuthenticated(userId, applicationId): Promise<boolean> {
//     const app = await this.appsService.getByAppId(applicationId)

//     if (!app) {
//       throw new Error(`App with ID ${applicationId} not found`)
//     }

//     const appData = app.data
//     if (!appData['requiresAuth']) {
//       return true
//     }

//     try {
//       const userAppAuth =
//         await this.userAppAuthRepo.findByUserIdAndAppIdAuthenticated(
//           userId,
//           applicationId
//         )
//       if (userAppAuth) {
//         this.logger.debug(`User ${userId}, App ${applicationId} Authenticated`)
//         return true
//       }

//       return false
//     } catch (e) {
//       return false
//     }
//   }
// }
