import { WorkspaceService } from '../../../../workspace'
import {
  AccountRepo,
  AccountService,
  AccountUserInviteTokenGenerator,
  AccountUserInviteTokenRepo,
} from '../../../../account'
import { AgentCaller } from '../../../agent'
import { ChatService } from '../chat.service'
import { UserService } from '../../../../user'
import { EmailDispatchGateway } from '../../../../email'
import { AppsRepo, AppsService } from '../../../../apps'
import { EventBus } from '../../../../event'
import { ChatRepo } from '../chat.repo'
import { ChatHistoryRole, Prisma, PrismaClient } from '@prisma/client'
import Chat from '../chat'
import { Chat as ChatModel } from '@prisma/client'
import { ChatGpt } from '../../llm'
import { EmbeddingService } from '../../../../ml'
import { AnalyticsEventTracker } from '../../../../analytics'
describe('ChatService', () => {
  let chatService: ChatService
  let accountService: jest.Mocked<AccountService>
  let agentCaller: jest.Mocked<AgentCaller>
  let accountRepo: jest.Mocked<AccountRepo>
  let accountUserInviteTokenRepo: jest.Mocked<AccountUserInviteTokenRepo>
  let userService: jest.Mocked<UserService>
  let workspaceService: jest.Mocked<WorkspaceService>
  let accountInviteTokenGenerator: jest.Mocked<AccountUserInviteTokenGenerator>
  let emailDispatchGateway: jest.Mocked<EmailDispatchGateway>
  let appsService: jest.Mocked<AppsService>
  let eventBus: jest.Mocked<EventBus>
  let chatRepo: jest.Mocked<ChatRepo>
  let prismaClient: jest.Mocked<PrismaClient>

  let appsRepo: jest.Mocked<AppsRepo>
  let embeddingService: jest.Mocked<EmbeddingService>
  let analyticsEventHandler: jest.Mocked<AnalyticsEventTracker>

  beforeEach(() => {
    accountService = jest.mocked<AccountService>(
      new AccountService(
        accountRepo,
        accountUserInviteTokenRepo,
        userService,
        workspaceService,
        accountInviteTokenGenerator,
        emailDispatchGateway,
        appsService,
        eventBus
      )
    )

    chatRepo = jest.mocked<ChatRepo>(new ChatRepo(prismaClient))

    jest.spyOn(chatRepo, 'saveChat').mockResolvedValue()

    appsService = jest.mocked<AppsService>(
      new AppsService(
        appsRepo,
        embeddingService,
        eventBus,
        analyticsEventHandler
      )
    )

    chatService = new ChatService(
      accountService,
      agentCaller,
      chatRepo,
      appsService
    )
  })

  describe('createNewChat', () => {
    it('creates new chat if there are no chats existent for the user', async () => {
      jest.spyOn(accountService, 'getAppsInAccount').mockResolvedValue([
        {
          id: 'test',
          name: 'test',
          apiKey: 'test',
          appId: 'test',
          createdAt: new Date(),
          creatorId: 'test',
          data: {
            actions: [],
            requiresAuth: false,
            sdkVersion: 'test',
          },
          deleted: false,
          description: 'test',
          handle: 'test',
          iconUrl: 'test',
          infoUrl: 'test',
          isDefault: false,
          isPublic: false,
          updatedAt: new Date(),
        },
      ])

      jest.spyOn(chatRepo, 'getChat').mockResolvedValue(null)

      await chatService.createNewChat(
        'accountId',
        'userId',
        'workspaceId',
        'clientId',
        'ChatGpt-3.5'
      )

      expect(chatRepo.saveChat).toHaveBeenCalledTimes(1)
    })

    it('uses the right llm', async () => {
      jest.spyOn(accountService, 'getAppsInAccount').mockResolvedValue([
        {
          id: 'test',
          name: 'test',
          apiKey: 'test',
          appId: 'test',
          createdAt: new Date(),
          creatorId: 'test',
          data: {
            actions: [],
            requiresAuth: false,
            sdkVersion: 'test',
          },
          deleted: false,
          description: 'test',
          handle: 'test',
          iconUrl: 'test',
          infoUrl: 'test',
          isDefault: false,
          isPublic: false,
          updatedAt: new Date(),
        },
      ])

      jest.spyOn(chatRepo, 'getChat').mockResolvedValue(null)
      const chat = await chatService.createNewChat(
        'accountId',
        'userId',
        'workspaceId',
        'clientId',
        'ChatGpt-3.5'
      )

      expect(chat.initializationProps.llm.name).toBe('ChatGpt')
    })

    it('returns the created chat', async () => {
      jest.spyOn(accountService, 'getAppsInAccount').mockResolvedValue([
        {
          id: 'test',
          name: 'test',
          apiKey: 'test',
          appId: 'test',
          createdAt: new Date(),
          creatorId: 'test',
          data: {
            actions: [],
            requiresAuth: false,
            sdkVersion: 'test',
          },
          deleted: false,
          description: 'test',
          handle: 'test',
          iconUrl: 'test',
          infoUrl: 'test',
          isDefault: false,
          isPublic: false,
          updatedAt: new Date(),
        },
      ])

      jest.spyOn(chatRepo, 'getChat').mockResolvedValue(null)
      const chat = await chatService.createNewChat(
        'accountId',
        'userId',
        'workspaceId',
        'clientId',
        'ChatGpt-3.5'
      )

      expect(chat).toBeDefined()
    })
  })

  describe('getChatsForUser', () => {
    it('returns chats for user', async () => {
      jest.spyOn(accountService, 'getAppsInAccount').mockResolvedValue([
        {
          id: 'test',
          name: 'test',
          apiKey: 'test',
          appId: 'test',
          createdAt: new Date(),
          creatorId: 'test',
          data: {
            actions: [],
            requiresAuth: false,
            sdkVersion: 'test',
          },
          deleted: false,
          description: 'test',
          handle: 'test',
          iconUrl: 'test',
          infoUrl: 'test',
          isDefault: false,
          isPublic: false,
          updatedAt: new Date(),
        },
      ])

      jest.spyOn(appsService, 'getById').mockResolvedValue({
        id: 'test',
        apiKey: 'test',
        appId: 'test',
        createdAt: new Date(),
        creatorId: 'test',
        data: {
          actions: [],
          requiresAuth: false,
          sdkVersion: 'test',
        },
        deleted: false,
        description: 'test',
        handle: 'test',
        iconUrl: 'test',
        infoUrl: 'test',
        isDefault: false,
        isPublic: false,
        name: 'test',
        updatedAt: new Date(),
      })

      jest.spyOn(chatRepo, 'getChat').mockResolvedValue(null)

      await chatService.createNewChat(
        'accountId',
        'userId',
        'workspaceId',
        'clientId',
        'ChatGpt-3.5'
      )

      const expectedData = [
        {
          id: 'test',
          accountId: 'test',
          clientId: 'test',
          createdAt: new Date(),
          agents: [],
          chatId: 'test',
          llmName: 'test',
          updatedAt: new Date(),
          userId: 'test',
          history: [],
        },
      ]

      jest.spyOn(chatRepo, 'getChatsForUser').mockResolvedValue(expectedData)

      const chats = await chatService.getChatsForUser('userId')
      expect(chats.length).toBe(1)
    })

    it('returns empty array if no chats exist for user', async () => {
      jest.spyOn(chatRepo, 'getChatsForUser').mockResolvedValue([])
      const chats = await chatService.getChatsForUser('userId')
      expect(chats.length).toBe(0)
    })
  })

  describe('saveChat', () => {
    it('Tries to save chat when there is no chat with same id present', async () => {
      jest.spyOn(accountService, 'getAppsInAccount').mockResolvedValue([
        {
          id: 'test',
          name: 'test',
          apiKey: 'test',
          appId: 'test',
          createdAt: new Date(),
          creatorId: 'test',
          data: {
            actions: [],
            requiresAuth: false,
            sdkVersion: 'test',
          },
          deleted: false,
          description: 'test',
          handle: 'test',
          iconUrl: 'test',
          infoUrl: 'test',
          isDefault: false,
          isPublic: false,
          updatedAt: new Date(),
        },
      ])

      jest.spyOn(chatRepo, 'saveChat').mockResolvedValue()
      jest.spyOn(chatRepo, 'getChat').mockResolvedValue(null)

      const chatToSave = new Chat({
        clientId: 'test',
        agents: [],
        llm: ChatGpt.create([]),
        accountId: 'test',
        userId: 'test',
        workspaceId: 'test',
      })

      await chatService.saveChat(chatToSave)
      const serializedChat = chatToSave.serialize()

      expect(chatRepo.saveChat).toHaveBeenCalled()
      const expectedCallData: Omit<
        ChatModel,
        'id' | 'createdAt' | 'updatedAt'
      > = {
        accountId: 'test',
        agents: serializedChat.initializationProps.agents,
        clientId: 'test',
        chatId: chatToSave.chatId,
        llmName: serializedChat.initializationProps.llm.name,
        userId: serializedChat.initializationProps.userId,
      }

      expect(chatRepo.saveChat).toHaveBeenCalledWith(expectedCallData)
    })

    it('Does not try to save chat when there is a chat with same chatId present', async () => {
      jest.spyOn(accountService, 'getAppsInAccount').mockResolvedValue([
        {
          id: 'test',
          name: 'test',
          apiKey: 'test',
          appId: 'test',
          createdAt: new Date(),
          creatorId: 'test',
          data: {
            actions: [],
            requiresAuth: false,
            sdkVersion: 'test',
          },
          deleted: false,
          description: 'test',
          handle: 'test',
          iconUrl: 'test',
          infoUrl: 'test',
          isDefault: false,
          isPublic: false,
          updatedAt: new Date(),
        },
      ])

      jest.spyOn(chatRepo, 'saveChat').mockResolvedValue()
      jest.spyOn(chatRepo, 'getChat').mockResolvedValue({
        accountId: 'test',
        agents: [],
        chatId: 'test',
        clientId: 'test',
        llmName: 'test',
        userId: 'test',
        id: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: 'test',
            uuid: 'test',
            agentName: 'test',
            text: 'test',
            agentPrompt: 'test',
            agentResponse: 'test',
            chatId: 'test',
            role: 'USER',
            timestamp: new Date().getTime(),
            rawLmResponse: 'test',
          },
        ],
      })

      const chatToSave = new Chat({
        clientId: 'test',
        agents: [],
        llm: ChatGpt.create([]),
        accountId: 'test',
        userId: 'test',
        workspaceId: 'test',
      })

      await chatService.saveChat(chatToSave)
      expect(chatRepo.saveChat).not.toHaveBeenCalled()
    })
  })

  describe('saveToHistory', () => {
    it('Calls the chat repo to save the chat history', async () => {
      const chatToSave = new Chat({
        clientId: 'test',
        agents: [],
        llm: ChatGpt.create([]),
        accountId: 'test',
        userId: 'test',
        workspaceId: 'test',
      })

      chatToSave.history = [
        {
          id: 'test',
          text: 'Hello!',
          role: 'user',
          timestamp: new Date().getTime(),
        },
        {
          id: 'test2',
          text: 'Hi!',
          role: 'llm',
          timestamp: new Date().getTime(),
          rawLmResponse: 'Hi!',
        },
      ]

      jest
        .spyOn(chatRepo, 'upsertToChatHistory')
        .mockResolvedValue(expect.anything())

      await chatService.saveToChatHistory(
        chatToSave.chatId,
        chatToSave.history[0]
      )
      await chatService.saveToChatHistory(
        chatToSave.chatId,
        chatToSave.history[1]
      )

      expect(chatRepo.upsertToChatHistory).toHaveBeenCalledTimes(2)
      expect(chatRepo.upsertToChatHistory).toHaveBeenCalledWith({
        chatId: chatToSave.chatId,
        role: ChatHistoryRole.USER,
        text: 'Hello!',
        timestamp: chatToSave.history[0].timestamp,
        agentName: null,
        uuid: chatToSave.history[0].id,
        agentPrompt: null,
        agentResponse: null,
        rawLmResponse: null,
      })

      expect(chatRepo.upsertToChatHistory).toHaveBeenCalledWith({
        chatId: chatToSave.chatId,
        role: ChatHistoryRole.LLM,
        text: 'Hi!',
        timestamp: chatToSave.history[1].timestamp,
        uuid: chatToSave.history[1].id,
        agentName: null,
        agentPrompt: null,
        agentResponse: null,
        rawLmResponse: 'Hi!',
      })
    })
  })

  describe('getChat', () => {
    it('returns a deserialized chat from the repo', async () => {
      jest.spyOn(chatRepo, 'getChat').mockResolvedValue({
        accountId: 'test',
        agents: [],
        chatId: 'test',
        clientId: 'test',
        llmName: 'test',
        userId: 'test',
        id: 'test',
        createdAt: new Date(),
        updatedAt: new Date(),
        history: [
          {
            id: 'test',
            agentName: 'test',
            text: 'test',
            agentPrompt: 'test',
            agentResponse: { data: 'test' } as Prisma.JsonObject,
            chatId: 'test',
            role: 'USER',
            uuid: 'test',
            timestamp: new Date().getTime(),
            rawLmResponse: 'test',
          },
        ],
      })

      const expectedChat = await chatService.getChat('chatId')
      expect(expectedChat).toBeDefined()
      expect(expectedChat?.initializationProps.llm.name).toBe('ChatGpt')
      expect(expectedChat?.initializationProps.agents.length).toBe(0)
      expect(expectedChat?.initializationProps.userId).toBe('test')
      expect(expectedChat?.initializationProps.clientId).toBe('test')
      expect(expectedChat?.initializationProps.workspaceId).toBe('N/A')
      expect(expectedChat?.initializationProps.accountId).toBe('test')
    })
  })
})
