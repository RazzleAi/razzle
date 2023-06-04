import { ChatGpt, SYSTEM_PROMPT } from '../chatgpt'
import { OpenAIApi } from 'openai'
import { createSandbox, SinonSandbox } from 'sinon'
import { Prompt } from '../../prompt'
describe('ChatGpt', () => {
  let chat: ChatGpt
  let sandbox: SinonSandbox

  beforeEach(() => {
    sandbox = createSandbox()
    sandbox.stub(OpenAIApi.prototype, 'createChatCompletion').resolves({
      data: {
        model: 'davinci:2020-05-03',
        created: 1619456552,
        object: 'text_completion',
        id: 'cmpl-2ZQ9Z5J5X9Z5J5Z5J5Z5J5Z5',
        choices: [
          {
            message: {
              role: 'assistant',
              content: 'Hello! How can I assist you today?',
            },
            index: 0,
            finish_reason: 'stop',
          },
        ],
      },
      status: 200,
      statusText: 'OK',
      headers: {
        'content-type': 'application/json',
      },
      config: {},
    })

    chat = new ChatGpt(new OpenAIApi(), [])
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('returns correct response from the openai api', () => {
    expect(chat.accept('Hello', [])).resolves.toEqual({
      message: 'Hello! How can I assist you today?',
    })
  })

  it('Uses the correct system prompt', () => {
    chat.accept('Hello', [])

    const basePrompt = new Prompt(SYSTEM_PROMPT, new Map([['agents', '']]))

    expect(
      (OpenAIApi.prototype.createChatCompletion as any).args[0][0].messages[0]
        .content
    ).toEqual(basePrompt.toString().trim())
  })

  it('Adds single user message to the messages', async () => {
    await chat.accept('Hello', [])

    expect(
      (OpenAIApi.prototype.createChatCompletion as any).args[0][0].messages[1]
        .content
    ).toEqual('Hello')
  })

  it('Added passed in history to the messages with right roles', async () => {
    await chat.accept('Hello', [
      { role: 'user', content: 'Hello' },
      { role: 'llm', content: 'Hello' },
    ])

    expect(
      (OpenAIApi.prototype.createChatCompletion as any).args[0][0].messages[1]
    ).toStrictEqual({ role: 'user', content: 'Hello' })

    expect(
      (OpenAIApi.prototype.createChatCompletion as any).args[0][0].messages[2]
    ).toStrictEqual({ role: 'assistant', content: 'Hello' })
  })
})
