import { Chat, ChatHistory } from '@prisma/client'

export interface ChatRepo {
  saveChat(chat: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>): Promise<void>
  getChatsForUser(
    userId: string
  ): Promise<(Chat & { history: ChatHistory[] })[]>

  upsertToChatHistory(
    chatHistory: Omit<ChatHistory, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<ChatHistory>

  getChat(chatId: string): Promise<(Chat & { history: ChatHistory[] }) | null>
}
