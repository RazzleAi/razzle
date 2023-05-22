export interface UserMessage {
  message: string
}

export interface LlmResponse {
  message: string
}

export interface LlmOpts {
  temperature: number
  model: string
  stop: string[]
}

export interface Llm {
  accept(message: string, opts?: LlmOpts): Promise<LlmResponse>
}

export interface ChatTunedLlm extends Llm {
  history: any[]
}
