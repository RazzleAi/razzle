export type AvailableChatLlms = 'ChatGpt-3.5' | 'MPT-7b'
export interface CreateNewChatDto {
  llm: AvailableChatLlms
}
