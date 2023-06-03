export interface UserMessage {
  message: string
}

export interface LlmResponse {
  message: string
  error?: string
}

export interface LlmOpts {
  temperature: number
  model: string
  stop?: string[]
}

export interface Llm {
  name: string
}

export interface InstructTunedLlm extends Llm {
  accept(message: string, opts?: LlmOpts): Promise<LlmResponse>
}

export type ChatLlmHIstoryItemRole = 'user' | 'llm'

export interface ChatLlmHistoryItem {
  role: ChatLlmHIstoryItemRole
  content: string
}

export interface ChatTunedLlm extends Llm {
  accept(message: string, history: ChatLlmHistoryItem[]): Promise<LlmResponse>
}
