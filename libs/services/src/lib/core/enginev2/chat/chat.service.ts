import { AvailableChatLlms } from '@razzle/dto'
import { AccountService } from '../../../account'
import Chat from './chat'
import {
  ChatHistory,
  ChatHistoryRole,
  Chat as ChatModel,
  Prisma,
} from '@prisma/client'
import { PromptResolverService } from '../../../ml'
import { Sequencer } from '../../engine/sequencer'
import { IAgent, NlpProxyAgent } from '../agent'
import { ChatTunedLlm } from '../llm/llm'
import { ChatGpt } from '../llm/chatgpt'
import { AgentCaller } from '../../agent'
import { ChatRepo } from './chat.repo'
import { AppsService } from '../../../apps'
import { ChatHistoryItem } from './chathistoryitem'
import { RazzleResponse } from '@razzle/sdk'

export class ChatService {
  constructor(
    private readonly accountService: AccountService,
    private readonly agentCaller: AgentCaller,
    private readonly chatRepo: ChatRepo,
    private readonly appService: AppsService
  ) {}

  chats: Map<string, Chat[]> = new Map()

  promptResolver = new PromptResolverService()
  sequencer = new Sequencer(this.agentCaller, this.promptResolver)

  async createNewChat(
    accountId: string,
    userId: string,
    workspaceId: string,
    clientId: string,
    llm: AvailableChatLlms
  ): Promise<Chat> {
    console.log('Client: Creating new chat')

    const allApps = await this.accountService.getAppsInAccount(accountId)

    const agents = allApps.map(
      (app) => new NlpProxyAgent(app, this.promptResolver, this.sequencer)
    )

    const chat = new Chat({
      accountId: accountId ?? '',
      workspaceId: workspaceId ?? '',
      userId: userId ?? '',
      agents,
      clientId,
      llm: this.getLLm(llm, agents),
    })

    await this.saveChat(chat)
    return chat
  }

  private getLLm(name: AvailableChatLlms, agents: IAgent[]): ChatTunedLlm {
    switch (name) {
      case 'ChatGpt-3.5':
        return ChatGpt.create(agents)

      default:
        return ChatGpt.create(agents)
    }
  }

  async getChatsForUser(userId: string): Promise<Chat[]> {
    const chats = await this.chatRepo.getChatsForUser(userId)
    const desirializedChats = await Promise.all(
      chats.map((c) => this.desirializedChat(c))
    )

    return desirializedChats
  }

  private async desirializedChat(
    chat: ChatModel & { history: ChatHistory[] }
  ): Promise<Chat> {
    const apps = await Promise.all(
      chat.agents.map(async (a) => {
        const app = this.appService.getById(a)
        return app
      })
    )
    const someAppsNotFound = apps.some((app) => !app)

    if (someAppsNotFound) {
      throw new Error('Some apps not found')
    }

    const agents = apps.map(
      (app) => new NlpProxyAgent(app!, this.promptResolver, this.sequencer)
    )

    const chatLm = this.getLLm(chat.llmName as AvailableChatLlms, agents)

    const desirializedChat = new Chat({
      accountId: chat.accountId,
      workspaceId: 'N/A', // We need to get rid of this idea of workspaces
      userId: chat.userId,
      agents,
      clientId: chat.clientId,
      llm: chatLm,
      chatId: chat.chatId,
    })

    desirializedChat.history = chat.history.map((h) => ({
      id: h.uuid,
      role: h.role === ChatHistoryRole.USER ? 'user' : 'llm',
      text: h.text,
      timestamp: h.timestamp,
      agent:
        h.agentName && h.agentPrompt
          ? {
              agentName: h.agentName,
              agentPrompt: h.agentPrompt,
              agentResponse: h.agentResponse
                ? (h.agentResponse as RazzleResponse)
                : undefined,
            }
          : undefined,
      rawLmResponse: h.rawLmResponse ?? undefined,
    }))

    return desirializedChat
  }

  async saveChat(chat: Chat): Promise<void> {
    console.log(`Saving chat ${chat.chatId}`)
    const serializedChat = chat.serialize()
    const chatToSave: Omit<ChatModel, 'id' | 'createdAt' | 'updatedAt'> = {
      accountId: serializedChat.initializationProps.accountId,
      agents: serializedChat.initializationProps.agents,
      clientId: serializedChat.initializationProps.clientId,
      chatId: serializedChat.chatId,
      llmName: serializedChat.initializationProps.llm.name,
      userId: serializedChat.initializationProps.userId,
    }

    const currentlyExistingChat = await this.getChat(chatToSave.chatId)

    if (!currentlyExistingChat) {
      console.log(`Chat ${chat.chatId} does not exist. Creating new one`)
      await this.chatRepo.saveChat(chatToSave)
    }
  }

  async saveToChatHistory(
    chatId: string,
    history: ChatHistoryItem
  ): Promise<void> {
    const historyToSave: Omit<ChatHistory, 'id' | 'createdAt' | 'updatedAt'> = {
      chatId,
      uuid: history.id,
      role:
        history.role === 'user' ? ChatHistoryRole.USER : ChatHistoryRole.LLM,
      text: history.text,
      rawLmResponse: history.rawLmResponse ?? null,
      timestamp: history.timestamp,
      agentName: history.agent?.agentName ?? null,
      agentPrompt: history.agent?.agentPrompt ?? null,
      agentResponse: (history.agent?.agentResponse as Prisma.JsonValue) ?? null,
    }

    console.log(`Saving history ${history.id} to chat ${chatId}`)

    await this.chatRepo.upsertToChatHistory(historyToSave)
  }

  async getChat(chatId: string): Promise<Chat | null> {
    const chat = await this.chatRepo.getChat(chatId)

    if (!chat) {
      return null
    }

    return this.desirializedChat(chat)
  }
}
