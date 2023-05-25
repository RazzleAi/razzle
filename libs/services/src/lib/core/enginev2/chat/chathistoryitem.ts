import { RazzleResponse } from '@razzle/sdk'

export interface ChatHistoryItem {
  id: string
  text: string
  agent?: ChatHistoryItemAgentProps
  role: 'user' | 'llm'
  timestamp: number
}

export interface ChatHistoryItemAgentProps {
  agentName: string
  agentPrompt: string
  agentResponse?: RazzleResponse
}
