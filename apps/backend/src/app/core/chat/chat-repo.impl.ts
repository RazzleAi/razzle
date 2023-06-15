 import { Injectable } from '@nestjs/common'
 import { Chat, ChatHistory, ChatRepo } from '@razzle/services'
import { PrismaService } from '../../prisma/prisma.service'
@Injectable()
export class ChatRepoImpl implements ChatRepo {
  constructor(private readonly prismaService: PrismaService) {}

  async saveChat(chat: Omit<Chat, 'id' | 'createdAt' | 'updatedAt'>) {
    await this.prismaService.chat.create({
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
    return this.prismaService.chat.findMany({
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
    return this.prismaService.chatHistory.upsert({
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
    return this.prismaService.chat.findUnique({
      where: {
        chatId,
      },
      include: {
        history: true,
      },
    })
  }

  async getChatHistory(uuid: string): Promise<ChatHistory | null> {
    return this.prismaService.chatHistory.findUnique({
      where: {
        uuid,
      },
    })
  }

  async updateChatHistory(
   uuid: string,
    data: Partial<Omit<ChatHistory, 'uuid' | 'id' | 'createdAt' | 'updatedAt'>>
  ) {
    return this.prismaService.chatHistory.update({
      where: {
        uuid,
      },
      data,
    })
  }
}
