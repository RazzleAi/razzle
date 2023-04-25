import { Agent } from './agent'

export interface AgentLifecycle {
  onClose(agent: Agent, reason: string, code: number): unknown
  onError(agent: Agent, error: any, message: string, type: string): unknown
}
