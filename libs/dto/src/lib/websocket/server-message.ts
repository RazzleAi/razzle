// import { RazzleResponse, RazzleResponseWithActionArgs } from '@razzledotai/sdk'
// import { Message } from './message'
// import { ClientResponse } from '../core'

// export type ServerMessageType = 'NewMessage' | 'Pong'


// /**
//  * @deprecated Use ServerMessageV2 instead
//  */
// export interface ServerMessage extends Message {
//   type: ServerMessageType
//   frameId?: string
//   data: {
//     appId: string
//     applicationId: string
//     appName: string
//     appDescription: string
//     message: RazzleResponse | RazzleResponseWithActionArgs
//   }
// }

// export interface ServerMessageV2 extends Message {
//   type: ServerMessageType
//   frameId?: string
//   data: ClientResponse
// }
