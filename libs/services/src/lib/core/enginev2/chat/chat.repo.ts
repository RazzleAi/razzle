import { PrismaClient } from '@prisma/client'
import { Chat, ChatHistory } from './types'

export class ChatRepo {
  constructor(private readonly prismaClient: PrismaClient) {}

  async saveChat(chat: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>) {
    await this.prismaClient.chat.create({
      data: {
        chatId: chat.chatId,
        accountId: chat.accountId,
        userId: chat.userId,
        clientId: chat.clientId,
        llmName: chat.llmName,
        agents: chat.agents,
      },
    })
  }

  async getChatsForUser(
    userId: string
  ): Promise<(Chat & { history: ChatHistory[] })[]> {
    return this.prismaClient.chat.findMany({
      where: {
        userId,
      },
      include: {
        history: true,
      },
    })
  }

  async upsertToChatHistory(
    chatHistory: Omit<ChatHistory, 'id' | 'createdAt' | 'updatedAt'>
  ) {
    return this.prismaClient.chatHistory.upsert({
      where: {
        uuid: chatHistory.uuid,
      },
      create: chatHistory,
      update: chatHistory,
    })
  }

  async getChat(
    chatId: string
  ): Promise<(Chat & { history: ChatHistory[] }) | null> {
    return this.prismaClient.chat.findUnique({
      where: {
        chatId,
      },
      include: {
        history: true,
      },
    })
  }

  async getChatHistory(uuid: string): Promise<ChatHistory | null> {
    return this.prismaClient.chatHistory.findUnique({
      where: {
        uuid,
      },
    })
  }

  async updateChatHistory(
    uuid: string,
    data: Partial<Omit<ChatHistory, 'uuid' | 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    return this.prismaClient.chatHistory.update({
      where: {
        uuid,
      },
      data,
    })
  }
}
