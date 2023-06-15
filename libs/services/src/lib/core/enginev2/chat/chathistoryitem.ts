import { RazzleResponse } from '@razzle/sdk'

export interface ChatHistoryItem {
  id: string
  text: string
  rawLmResponse?: string
  agent?: ChatHistoryItemAgentProps
  role: 'user' | 'llm'
  timestamp: number,
  userReaction: 'THUMBS_UP' | 'THUMBS_DOWN'| null
}

export interface ChatHistoryItemAgentProps {
  agentName: string
  agentPrompt: string
  agentResponse?: RazzleResponse
}
