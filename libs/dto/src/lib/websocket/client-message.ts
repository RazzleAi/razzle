// import { ClientRequest, Message } from '../core'

// export type ClientMessageType = 'CallAction' | 'Ping' | 'Message'

// /**
//  * @deprecated Use ClientMessageV3 instead
//  */
// export interface ClientMessage extends Message {
//   frameId?: string
//   type: ClientMessageType
//   data?: CallActionData[]
// }

// export interface CallActionData {
//   action: string
//   prompt?: string
//   appId: string
//   args: {
//     arg: string
//     value: any
//   }[]
// }

// /**
//  * @deprecated Use ClientMessageV3 instead
//  */
// export interface ClientMessageV2 extends Message {
//   frameId?: string
//   type: ClientMessageType
//   data: string
// }

// export interface ClientMessageV3 extends Message {
//   frameId?: string
//   type: ClientMessageType
//   data: ClientRequest
// }
