import { RazzleResponse } from '@razzle/sdk'
import { ChatLlmHistoryItem, ChatTunedLlm, LlmResponse } from '../../llm'
import Chat from '../chat'
import { SinonSandbox, createSandbox } from 'sinon'
import { IChat } from '../chatinterface'

describe('Chat', () => {
  let chat: Chat
  let sandbox: SinonSandbox
  let chatTunedLlm: TestLlm
  const chatLoopLimit = 4

  beforeEach(() => {
    sandbox = createSandbox()
    chatTunedLlm = new TestLlm()

    chat = new Chat({
      llm: chatTunedLlm,
      agents: [],
      accountId: 'accountId',
      workspaceId: 'workspaceId',
      userId: 'userId',
      clientId: 'clientId',
      agentChatLoopLimit: chatLoopLimit,
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('created a chatid on creation', () => {
    expect(chat.chatId).toBeDefined()
    expect(chat.chatId.length)
  })

  describe('accept', () => {
    it('calls the llm when a message is received', async () => {
      sandbox
        .stub(TestLlm.prototype, 'accept')
        .resolves({ message: 'response' })

      const acceptanceGenerator = chat.accept('message')
      await acceptanceGenerator.next() // Skip the first yield message id
      await acceptanceGenerator.next()
      expect((TestLlm.prototype.accept as any).args[0][0]).toBe('message')
    })

    it('adds the user message to the history', async () => {
      sandbox
        .stub(TestLlm.prototype, 'accept')
        .resolves({ message: 'response' })

      const acceptanceGenerator = chat.accept('message')
      await acceptanceGenerator.next() // Skip the first yield message id
      expect(chat.history.length).toBe(1)
      expect(chat.history[0].role).toBe('user')
      expect(chat.history[0].text).toBe('message')
    })

    it('adds the llm response to the history', async () => {
      sandbox
        .stub(TestLlm.prototype, 'accept')
        .resolves({ message: 'response' })

      const acceptanceGenerator = chat.accept('message')
      await acceptanceGenerator.next() // Skip the first yield message id
      await acceptanceGenerator.next()
      expect(chat.history.length).toBe(2)
      expect(chat.history[1].role).toBe('llm')
      expect(chat.history[1].text).toBe('response')
    })

    it('uses a valid uuid v1 for the message id on every message', async () => {
      sandbox
        .stub(TestLlm.prototype, 'accept')
        .resolves({ message: 'response' })

      const acceptanceGenerator = chat.accept('message')
      await acceptanceGenerator.next() // Skip the first yield message id
      await acceptanceGenerator.next()
      const someIdsFialedTest = chat.history.some((item) => {
        // Does not match the uuid v1 pattern
        return !/^[0-9a-f]{8}-[0-9a-f]{4}-1[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
          item.id
        )
      })

      expect(someIdsFialedTest).toBe(false)
    })

    it('uses different ids for each message', async () => {
      sandbox
        .stub(TestLlm.prototype, 'accept')
        .resolves({ message: 'response' })

      const acceptanceGenerator = chat.accept('message')
      await acceptanceGenerator.next() // Skip the first yield message id
      await acceptanceGenerator.next()

      const acceptanceGenerator2 = chat.accept('message')
      await acceptanceGenerator2.next() // Skip the first yield message id
      await acceptanceGenerator2.next()
      expect(chat.history[0].id).not.toBe(chat.history[1].id)
    })

    it('prompts the proper agent when the llm response contains an agent call', async () => {
      sandbox
        .stub(TestLlm.prototype, 'accept')
        .onFirstCall()
        .resolves({
          message: `
      Sure! using the summaryToolBox agent to summerize the text

      \`\`\`json
      {"agent": "summaryToolBox", "instruction": "Summerize this test: The quick brown fox jumped over the lazy dog"}
      \`\`\`
    `,
        })
        .onSecondCall()
        .resolves({
          message: 'Agent responded with data',
        })

      const agentStub = sandbox.stub()
      agentStub.resolves({ message: 'agent response' })

      const scopedChat = new Chat({
        llm: chatTunedLlm,
        agents: [
          {
            id: 'summaryToolBox',
            name: 'summaryToolBox',
            accept: agentStub,
            description: 'A tool to summerize text',
          },
        ],
        accountId: 'accountId',
        workspaceId: 'workspaceId',
        userId: 'userId',
        clientId: 'clientId',
      })

      const acceptanceGenerator = scopedChat.accept('message')
      while ((await acceptanceGenerator.next()).done === false) {
        // Do nothing
      }

      expect(agentStub.callCount).toBe(1)
      expect(agentStub.args[0][0]).toStrictEqual({
        accountId: 'accountId',
        clientId: 'clientId',
        prompt:
          'Summerize this test: The quick brown fox jumped over the lazy dog',
        userId: 'userId',
        workspaceId: 'workspaceId',
      })
    })

    it('includes the raw llm response in the history', async () => {
      const llmResponse = `
      Sure! using the summaryToolBox agent to summerize the text

      \`\`\`json
      {"agent": "summaryToolBox", "instruction": "Summerize this test: The quick brown fox jumped over the lazy dog"}
      \`\`\`
    `
      sandbox
        .stub(TestLlm.prototype, 'accept')
        .onFirstCall()
        .resolves({
          message: llmResponse,
        })
        .onSecondCall()
        .resolves({
          message: 'Agent responded with data',
        })

      const agentStub = sandbox.stub()
      agentStub.resolves({ message: 'agent response' })

      const scopedChat = new Chat({
        llm: chatTunedLlm,
        agents: [
          {
            id: 'summaryToolBox',
            name: 'summaryToolBox',
            accept: agentStub,
            description: 'A tool to summerize text',
          },
        ],
        accountId: 'accountId',
        workspaceId: 'workspaceId',
        userId: 'userId',
        clientId: 'clientId',
      })

      const acceptanceGenerator = scopedChat.accept('message')
      while ((await acceptanceGenerator.next()).done === false) {
        // Do nothing
      }

      expect(scopedChat.history[1].rawLmResponse?.trim()).toBe(
        llmResponse.trim()
      )
    })

    it('calls the llm with the passed history', async () => {
      const agentStub = sandbox.stub()
      agentStub.resolves({ message: 'agent response' })

      const llm = {
        ...chatTunedLlm,
        accept: sandbox.stub().resolves({ message: 'response' }),
      }

      const scopedChat = new Chat({
        llm,
        agents: [
          {
            id: 'summaryToolBox',
            name: 'summaryToolBox',
            accept: agentStub,
            description: 'A tool to summerize text',
          },
        ],
        accountId: 'accountId',
        workspaceId: 'workspaceId',
        userId: 'userId',
        clientId: 'clientId',
      })

      const acceptanceGenerator = scopedChat.accept('message')
      while ((await acceptanceGenerator.next()).done === false) {
        // Do nothing
      }

      expect(llm.accept.callCount).toBe(1)
      expect(llm.accept.args[0][0]).toBe('message')

      const acceptanceGenerator2 = scopedChat.accept('message2')
      while ((await acceptanceGenerator2.next()).done === false) {
        // Do nothing
      }

      expect(llm.accept.callCount).toBe(2)
      expect(llm.accept.args[1][1]).toStrictEqual([
        {
          role: 'user',
          content: 'message',
        },
        {
          role: 'llm',
          content: 'response',
        },
      ])
    })

    it('adds the agent response to the proper message in the history', async () => {
      sandbox
        .stub(TestLlm.prototype, 'accept')
        .onFirstCall()
        .resolves({
          message: `
      Sure! using the summaryToolBox agent to summerize the text

      \`\`\`json
      {"agent": "summaryToolBox", "instruction": "Summerize this test: The quick brown fox jumped over the lazy dog"}
      \`\`\`
    `,
        })
        .onSecondCall()
        .resolves({
          message: 'Agent responded with data',
        })

      const agentStub = sandbox.stub()
      const agent2Stub = sandbox.stub()
      agentStub.resolves({
        data: { message: 'Agent response' },
      } as RazzleResponse)

      const scopedChat = new Chat({
        llm: chatTunedLlm,
        agents: [
          {
            id: 'summaryToolBox',
            name: 'summaryToolBox',
            accept: agentStub,
            description: 'A tool to summerize text',
          },
          {
            id: 'agent2',
            name: 'agent2',
            accept: agent2Stub,
            description: 'Just a tool to test the agent array',
          },
        ],
        accountId: 'accountId',
        workspaceId: 'workspaceId',
        userId: 'userId',
        clientId: 'clientId',
      })

      const acceptanceGenerator = scopedChat.accept('message')
      while ((await acceptanceGenerator.next()).done === false) {
        // Do nothing
      }

      expect(scopedChat.history[1].role).toBe('llm')
      expect(scopedChat.history[1].agent).toBeDefined()
      expect(scopedChat.history[1].agent!.agentName).toBe('summaryToolBox')
      expect(scopedChat.history[1].agent!.agentPrompt).toBe(
        'Summerize this test: The quick brown fox jumped over the lazy dog'
      )
      expect(scopedChat.history[1].agent!.agentResponse).toStrictEqual({
        data: { message: 'Agent response' },
      })
    })

    it('If there is a data reponse from the agent, send it to the llm', async () => {
      sandbox
        .stub(TestLlm.prototype, 'accept')
        .onFirstCall()
        .resolves({
          message: `
      Sure! using the summaryToolBox agent to summerize the text

      \`\`\`json
      {"agent": "summaryToolBox", "instruction": "Summerize this test: The quick brown fox jumped over the lazy dog"}
      \`\`\`
    `,
        })
        .onSecondCall()
        .resolves({
          message: 'Agent responded with data',
        })

      const agentDataResponse = { message: 'Agent response' }
      const agentStub = sandbox.stub()
      agentStub.resolves({
        data: agentDataResponse,
      } as RazzleResponse)

      const scopedChat = new Chat({
        llm: chatTunedLlm,
        agents: [
          {
            id: 'summaryToolBox',
            name: 'summaryToolBox',
            accept: agentStub,
            description: 'A tool to summerize text',
          },
        ],
        accountId: 'accountId',
        workspaceId: 'workspaceId',
        userId: 'userId',
        clientId: 'clientId',
      })

      const acceptanceGenerator = scopedChat.accept('message')
      while ((await acceptanceGenerator.next()).done === false) {
        // Do nothing
      }

      expect((TestLlm.prototype.accept as any).args[1][0]).toBe(
        `
        \`\`\`json
        {response: ${JSON.stringify(agentDataResponse)}}
        \`\`\`
        `
      )
    })

    it('adds a millisecond timestamp to each message', async () => {
      sandbox
        .stub(TestLlm.prototype, 'accept')
        .resolves({ message: 'response' })

      const acceptanceGenerator = await chat.accept('message')
      await acceptanceGenerator.next()
      await acceptanceGenerator.next()
      expect(chat.history[0].timestamp).toBeGreaterThan(0)
    })

    it('exists with error message when the chat loop runs up to the max number of iterations', async () => {
      const agentCallMessage = `
      Sure! using the summaryToolBox agent to summerize the text

      \`\`\`json
      {"agent": "summaryToolBox", "instruction": "Summerize this test: The quick brown fox jumped over the lazy dog"}
      \`\`\`
    `
      sandbox
        .stub(TestLlm.prototype, 'accept')
        .onFirstCall()
        .resolves({
          message: agentCallMessage,
        })
        .onSecondCall()
        .resolves({
          message: agentCallMessage,
        })
        .onThirdCall()
        .resolves({
          message: agentCallMessage,
        })

      const agentStub = sandbox.stub()
      agentStub.resolves({
        data: {},
      } as RazzleResponse)

      const scopedChat = new Chat({
        llm: chatTunedLlm,
        agents: [
          {
            id: 'summaryToolBox',
            name: 'summaryToolBox',
            accept: agentStub,
            description: 'A tool to summerize text',
          },
        ],
        accountId: 'accountId',
        workspaceId: 'workspaceId',
        userId: 'userId',
        clientId: 'clientId',
        agentChatLoopLimit: 2,
      })

      const acceptanceGenerator = scopedChat.accept('message')
      while ((await acceptanceGenerator.next()).done === false) {
        // Do nothing
      }

      expect(scopedChat.history[scopedChat.history.length - 1].text).toBe(
        'Hey! It looks like I would not fulfil that request, maybe try and rephrase your prompt'
      )
    })
  })

  describe('serialize', () => {
    it('Serializes the chat object with no agents properly', () => {
      const chat = new Chat({
        llm: chatTunedLlm,
        accountId: 'accountId',
        workspaceId: 'workspaceId',
        agents: [],
        userId: 'userId',
        clientId: 'clientId',
      })

      const expectedSerializedChat: IChat = {
        chatId: chat.chatId,
        history: [],
        initializationProps: {
          accountId: 'accountId',
          agents: [],
          llm: {
            name: chatTunedLlm.name,
          },
          clientId: 'clientId',
          userId: 'userId',
          workspaceId: 'workspaceId',
        },
      }

      expect(chat.serialize()).toStrictEqual(expectedSerializedChat)
    })

    it('Serializes the chat object with agents properly (using the agent id)', () => {
      const agentStub = sandbox.stub()

      const chat = new Chat({
        llm: chatTunedLlm,
        accountId: 'accountId',
        workspaceId: 'workspaceId',
        agents: [
          {
            id: 'summaryToolBoxId',
            name: 'summaryToolBox',
            accept: agentStub,
            description: 'A tool to summerize text',
          },
        ],
        userId: 'userId',
        clientId: 'clientId',
      })

      const expectedSerializedChat: IChat = {
        chatId: chat.chatId,
        history: [],
        initializationProps: {
          accountId: 'accountId',
          agents: ['summaryToolBoxId'],
          llm: {
            name: chatTunedLlm.name,
          },
          clientId: 'clientId',
          userId: 'userId',
          workspaceId: 'workspaceId',
        },
      }

      expect(chat.serialize()).toStrictEqual(expectedSerializedChat)
    })

    it('Serializes the chat history properly ', async () => {
      const agentStub = sandbox.stub()
      const agentDataResponse: RazzleResponse = {
        data: { message: 'Agent response' },
      }
      agentStub.resolves(agentDataResponse)

      const llmResponse = `
      Sure! using the summaryToolBox agent to summerize the text

      \`\`\`json
      {"agent": "summaryToolBox", "instruction": "Summerize this test: The quick brown fox jumped over the lazy dog"}
      \`\`\`
    `

      sandbox
        .stub(TestLlm.prototype, 'accept')
        .onFirstCall()
        .resolves({
          message: llmResponse,
        })
        .onSecondCall()
        .resolves({
          message: 'Agent responded with data',
        })

      const chat = new Chat({
        llm: chatTunedLlm,
        accountId: 'accountId',
        workspaceId: 'workspaceId',
        agents: [
          {
            id: 'summaryToolBoxId',
            name: 'summaryToolBox',
            accept: agentStub,
            description: 'A tool to summerize text',
          },
        ],
        userId: 'userId',
        clientId: 'clientId',
      })

      const acceptanceGenerator = chat.accept('message')
      while ((await acceptanceGenerator.next()).done === false) {
        // Do nothing
      }

      const expectedSerializedChat: IChat = {
        chatId: chat.chatId,
        history: [
          {
            id: chat.history[0].id,
            text: 'message',
            role: 'user',
            timestamp: chat.history[0].timestamp,
          },
          {
            id: chat.history[1].id,
            text: `Sure! using the summaryToolBox agent to summerize the text`,
            role: 'llm',
            timestamp: chat.history[1].timestamp,
            rawLmResponse: llmResponse,
            agent: {
              agentName: 'summaryToolBox',
              agentPrompt:
                'Summerize this test: The quick brown fox jumped over the lazy dog',
              agentResponse: agentDataResponse,
            },
          },
          {
            id: chat.history[2].id,
            text: 'Agent responded with data',
            role: 'llm',
            rawLmResponse: 'Agent responded with data',
            timestamp: chat.history[2].timestamp,
          },
        ],
        initializationProps: {
          accountId: 'accountId',
          agents: ['summaryToolBoxId'],
          llm: {
            name: 'test',
          },
          clientId: 'clientId',
          userId: 'userId',
          workspaceId: 'workspaceId',
        },
      }

      expect(chat.serialize()).toStrictEqual(expectedSerializedChat)
    })
  })
})

class TestLlm implements ChatTunedLlm {
  name = 'test'
  accept(message: string, history: ChatLlmHistoryItem[]): Promise<LlmResponse> {
    return Promise.resolve({ message: 'response' })
  }
}
