// import { ClientRequest, ClientToServerMessage, StepDto } from '@razzle/dto'
// import { RazzleResponse } from '@razzledotai/sdk'
// import { ILogger } from '../logging'
// import { MessagePublisher } from '../messaging'
// import { PromptAndSteps } from '../ml'
// import { UserService } from '../user'
// import { WorkspaceService } from '../workspace'
// import { Client, IncomingMessageHandler } from './client'

// export class IncomingFromClientMessageHandler
//   implements IncomingMessageHandler
// {
//   constructor(
//     private readonly logger: ILogger,
//     private readonly userSerivce: UserService,
//     private readonly workspaceService: WorkspaceService,
//     private readonly messagePublisher: MessagePublisher
//   ) {}

//   handleMessageFromClient(
//     workspaceId: string,
//     client: Client,
//     message: ClientToServerMessage<ClientRequest>
//   ) {
//     switch (message.event) {
//       case 'CallAction':
//         if (!message.data) {
//           this.logger.error('No request data')
//           return
//         }

//         return this.handleCallActionEvent(
//           workspaceId,
//           client,
//           message.data.payload,
//           message.data.headers
//         )
//       default:
//         return
//     }
//   }

//   async handleCallActionEvent(
//     workspaceId: string,
//     client: Client,
//     promptSteps: PromptAndSteps,
//     headers: NodeJS.Dict<string | any> = {}
//   ) {
//     // get user id from client authUid
//     const user = await this.userSerivce.getUserByAuthUid(client.authUid)

//     if (!user) {
//       this.logger.error(`User not found for authUid ${client.authUid}`)
//       return
//     }

//     const result = await this.workspaceService.executePrompt(
//       workspaceId,
//       user.id,
//       client.accountId,
//       promptSteps,
//       headers
//     )

//     if (!result) {
//       return
//     }

//     const stepDto = result[0] as StepDto
//     const output = result[1] as RazzleResponse
//     try {
//       await this.messagePublisher.publishMessageToClientId(
//         client.id,
//         JSON.stringify({
//           event: 'FuncResponse',
//           data: {
//             headers: {
//               ...headers,
//             },
//             payload: {
//               ...output,
//               userId: user.id,
//               clientId: client.id,
//               appId: stepDto.appId,
//             },
//           },
//         })
//       )
//     } catch (e) {
//       this.logger.error(e)
//     }
//   }

//   private async validateAppIdAndAction(
//     appId: string,
//     actionName: string
//   ): Promise<boolean> {
//     // TODO: validate appId and actionName
//     return true
//   }
// }
