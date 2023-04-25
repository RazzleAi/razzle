// import { AgentToServerMessage } from '@razzle/dto'
// import { AppsService } from '../apps'
// import { ILogger } from '../logging'
// import { ConnectedClientManager } from './connected-client-manager'

// export class ClientBoundMessageHandler {
//   constructor(
//     private readonly logger: ILogger,
//     private readonly connectedClientManager: ConnectedClientManager,
//     private readonly appsService: AppsService
//   ) {}

//   // async handleClientBoundMessage(data: string) {
//   //   const agentResponse = JSON.parse(data)
//   //   const { message } = agentResponse

//   //   switch (message.event) {
//   //     case 'FuncResponse': {
//   //       this.handleFuncResponse(agentResponse)
//   //       break
//   //     }

//   //     case 'AuthenticateResponse': {
//   //       this.handleAuthenticationResponse(agentResponse)
//   //       break
//   //     }
//   //   }
//   // }

//   async handleClientBoundMessage(data: string) {
//     const message = JSON.parse(data)
//     // const { message } = agentResponse

//     switch (message.event) {
//       case 'FuncResponse': {
//         this.handleFuncResponse(message)
//         break
//       }

//       case 'AuthenticateResponse': {
//         this.handleAuthenticationResponse(message)
//         break
//       }
//     }
//   }

//   handleAuthenticationResponse(agentResponse: any) {
//     const { clientId, message } = agentResponse
//     this.logger.debug(`Agent To Server Message: ${JSON.stringify(message)}`)
//     const client =
//       this.connectedClientManager.getIdentifiedClientByClientId(clientId)
//     if (!client) {
//       this.logger.debug(`Client not found`)
//       return
//     }

//     client.handleAuthenticationResponse(message)
//   }

//   async handleFuncResponse(message: any) {
//     const appId = message.data.payload.appId
//     const client =
//       this.connectedClientManager.getIdentifiedClient(message.data.payload)

//     const app = await this.appsService.getByAppId(appId)
//     if (!app) {
//       this.logger.debug(`App with ID ${appId} not found`)
//       return
//     }
    
//     const { name: appName, description: appDescription } = app
//     const response: AgentToServerMessage<any> = {
//       event: 'FuncResponse',
//       data: {
//         appId: app.id,
//         applicationId: app.appId,
//         appName,
//         appDescription,
//         message: message.data.payload,
//       },
//     }

//     if (client) {
//       client.handleCallActionResponse(response)
//     }
//   }
// }
