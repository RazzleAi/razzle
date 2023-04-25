import { AgentMessage, ServerToAgentMessage } from '@razzle/dto'

export interface AgentToEngineMessenger {
  sendMessageToEngine(resp: AgentMessage): Promise<void>
  sendMessageToAgent(
    appId: string,
    response: ServerToAgentMessage<AgentMessage>
  ): Promise<void>  
  onResponseReceivedFromAgent(
    callback: (response: AgentMessage) => void
  ): Promise<void>
}
