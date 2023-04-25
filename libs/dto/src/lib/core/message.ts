export interface Message {
    __objType__: MessageType
  }
  
  export type MessageType =
    | 'ClientMessage'
    | 'ServerMessage'
    | 'ServerMessageV2'
    | 'AuthenticationResponseMessage'
    | 'ClientMessageV2'
    | 'ClientMessageV3'
  
  export type ServerMessageType = 'NewMessage' | 'Pong'