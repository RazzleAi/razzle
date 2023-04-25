
// import { Controller, Param, Post, Query } from '@nestjs/common'
// import {
//   AgentRequest,
//     AgentToServerMessage
// } from '@razzle/dto'
// import { UseExceptionResponseHandler } from '../decorators'
// import { ConnectedAgentManager } from './connected-agent-manager'
// import { IncomingMessageHandlerImpl } from './incoming-message-handler'

// @UseExceptionResponseHandler()
// @Controller('agent')
// export class AgentController {


//   constructor(
//     private readonly agentMessageHandler: IncomingMessageHandlerImpl,
//     private readonly connectedAgentManager: ConnectedAgentManager,
//   ) {}


//   @Post('/user-app-authentication')
//   async updateUserAppAuthentication(@Query("userId") userId: string, @Query("appId") appId: string,) {
//     const agent = this.connectedAgentManager.getAgents()[0]
//     this.agentMessageHandler.handleMessage(
//       agent,
//       {
//         event: 'UserAppAuthentication',
//         data: {
//           payload: {
//             userId, 
//             appId,
//           }
//         },
//       } as AgentToServerMessage<AgentRequest>
//     );
//   }


// }
