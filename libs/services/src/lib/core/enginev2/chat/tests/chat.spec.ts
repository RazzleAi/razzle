import { RazzleResponse } from '@razzle/sdk'
import { ChatTunedLlm } from '../../llm'
import Chat from '../chat'
import { SinonSandbox, createSandbox } from 'sinon'

describe('Chat', () => {
  let chat: Chat
  let sandbox: SinonSandbox
  let chatTunedLlm: TestLlm

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
    })
  })

  afterEach(() => {
    sandbox.restore()
  })

  describe('accept', () => {
    it('calls the llm when a message is received', () => {
      sandbox
        .stub(TestLlm.prototype, 'accept')
        .resolves({ message: 'response' })

      chat.accept('message')
      expect((TestLlm.prototype.accept as any).args[0][0]).toBe('message')
    })

    it('adds the user message to the history', () => {
      sandbox
        .stub(TestLlm.prototype, 'accept')
        .resolves({ message: 'response' })

      chat.accept('message')
      expect(chat.history.length).toBe(1)
      expect(chat.history[0].role).toBe('user')
      expect(chat.history[0].text).toBe('message')
    })

    it('adds the llm response to the history', async () => {
      sandbox
        .stub(TestLlm.prototype, 'accept')
        .resolves({ message: 'response' })

      await chat.accept('message')
      expect(chat.history.length).toBe(2)
      expect(chat.history[1].role).toBe('llm')
      expect(chat.history[1].text).toBe('response')
    })

    it('uses a valid uuid v1 for the message id on every message', async () => {
      sandbox
        .stub(TestLlm.prototype, 'accept')
        .resolves({ message: 'response' })

      await chat.accept('message')

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

      await chat.accept('message')
      await chat.accept('message')
      expect(chat.history[0].id).not.toBe(chat.history[1].id)
    })

    it('prompts the proper agent when the llm response contains an agent call', async () => {
      sandbox
        .stub(TestLlm.prototype, 'accept')
        .onFirstCall()
        .resolves({
          message: `
      Sure! using the summaryToolBox agent to summerize the text

      \`\`\`
      {"tool": "summaryToolBox", "instruction": "Summerize this test: The quick brown fox jumped over the lazy dog"}
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

      await scopedChat.accept('message')

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

    it('adds the agent response to the proper message in the history', async () => {
      sandbox
        .stub(TestLlm.prototype, 'accept')
        .onFirstCall()
        .resolves({
          message: `
      Sure! using the summaryToolBox agent to summerize the text

      \`\`\`
      {"tool": "summaryToolBox", "instruction": "Summerize this test: The quick brown fox jumped over the lazy dog"}
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
            name: 'summaryToolBox',
            accept: agentStub,
            description: 'A tool to summerize text',
          },
          {
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

      await scopedChat.accept('message')

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

      \`\`\`
      {"tool": "summaryToolBox", "instruction": "Summerize this test: The quick brown fox jumped over the lazy dog"}
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

      await scopedChat.accept('message')

      expect((TestLlm.prototype.accept as any).args[1][0]).toBe(
        `
        \`\`\`
        {response: ${JSON.stringify(agentDataResponse)}}
        \`\`\`
        `
      )
    })
  })
})

class TestLlm implements ChatTunedLlm {
  accept(message: string): Promise<any> {
    return Promise.resolve()
  }
  history: any[]
}
