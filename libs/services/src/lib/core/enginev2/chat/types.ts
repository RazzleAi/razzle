import {
  Chat as PrismaChat,
  ChatHistory as PrismaChatHistory,
  ChatHistoryRole as PrismaChatHistoryRole,
} from '@prisma/client'

export type Chat = PrismaChat
export type ChatHistory = PrismaChatHistory

export const ChatHistoryRole = PrismaChatHistoryRole
export type ChatHistoryRole = PrismaChatHistoryRole