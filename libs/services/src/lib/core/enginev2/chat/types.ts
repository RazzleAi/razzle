import {
  Chat as PrismaChat,
  ChatHistory as PrismaChatHistory,
  ChatHistoryRole as PrismaChatHistoryRole,
  ReactionType as PrismaReactionType,
} from '@prisma/client'

export type Chat = PrismaChat
export type ChatHistory = PrismaChatHistory

export const ChatHistoryRole = PrismaChatHistoryRole
export type ChatHistoryRole = PrismaChatHistoryRole
export const ReactionType = PrismaReactionType
export type ReactionType = PrismaReactionType