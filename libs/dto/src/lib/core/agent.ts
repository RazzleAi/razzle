export interface AgentMessage {
  appId: string
  payload: { [key: string]: any }
  headers?: Record<string, string | string[]>
}
