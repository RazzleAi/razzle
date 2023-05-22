export type ClientToServerEvent =
  | 'Ping'
  | 'Identify'
  | 'Message'
  | 'CallAction'
  | 'CreateNewChat'
  | 'NewChatSelected'
export type AgentToServerEvent =
  | 'SyncApp'
  | 'FuncResponse'
  | 'AuthenticateResponse'
  | 'UserAppAuthentication'
export type ServerToAgentEvent =
  | 'CallFunction'
  | 'SyncAppResponse'
  | 'Authenticate'
export type ServerToClientEvent =
  | 'History'
  | 'AuthenticationResponse'
  | 'UserAppAuthentication'
  | 'ActivateWorkspace'
  | 'CreateWorkspace'
  | 'DeleteWorkspace'

export interface ClientToServerMessage<T> {
  event: ClientToServerEvent
  data?: T
}

export interface AgentToServerMessage<T> {
  event: AgentToServerEvent
  data?: T
}

export interface ServerToAgentMessage<T> {
  event: ServerToAgentEvent
  data?: T
}

export interface ServerToClientMessage<T> {
  event: ServerToClientEvent
  data?: T
}
