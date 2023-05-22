import { BASE_PROMPT, ChatGpt, INIT_MESSAGE, SYSTEM_PROMPT } from '../chatgpt'
import { OpenAIApi } from 'openai'
import { createSandbox, SinonSandbox } from 'sinon'
import { Prompt } from '../../prompt'
describe('ChatGpt', () => {
  let chat: ChatGpt
  let sandbox: SinonSandbox

  beforeEach(() => {
    sandbox = createSandbox()
    chat = new ChatGpt(new OpenAIApi(), [])
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('returns correct response from the openai api', () => {
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

    expect(chat.accept('Hello')).resolves.toEqual({
      message: 'Hello! How can I assist you today?',
    })
  })

  it('Uses the correct system message', () => {
    sandbox.spy(OpenAIApi.prototype, 'createChatCompletion')
    chat.accept('Hello')
    expect(
      (OpenAIApi.prototype.createChatCompletion as any).args[0][0].messages[0]
        .content
    ).toEqual(SYSTEM_PROMPT)
  })

  it('Uses the correct base prompt', () => {
    sandbox.spy(OpenAIApi.prototype, 'createChatCompletion')

    chat.accept('Hello')

    const basePrompt = new Prompt(BASE_PROMPT, new Map([['agents', '']]))

    expect(
      (OpenAIApi.prototype.createChatCompletion as any).args[0][0].messages[1]
        .content
    ).toEqual(basePrompt.toString())
  })

  it('Uses the correct init message', () => {
    sandbox.spy(OpenAIApi.prototype, 'createChatCompletion')
    chat.accept('Hello')

    expect(
      (OpenAIApi.prototype.createChatCompletion as any).args[0][0].messages[2]
        .content
    ).toEqual(INIT_MESSAGE)
  })

  it('Adds single user message to the messages', () => {
    sandbox.spy(OpenAIApi.prototype, 'createChatCompletion')
    chat.accept('Hello')

    expect(
      (OpenAIApi.prototype.createChatCompletion as any).args[0][0].messages[3]
        .content
    ).toEqual('Hello')
  })

  it("Appends the user's message to the history", () => {
    sandbox.spy(OpenAIApi.prototype, 'createChatCompletion')
    chat.accept('Hello')

    expect(chat.history).toEqual([{ role: 'user', content: 'Hello' }])
  })

  it('Adds received message to the history', async () => {
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
              content: 'hi',
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

    await chat.accept('Hello')
    expect(chat.history).toEqual([
      { role: 'user', content: 'Hello' },
      { role: 'assistant', content: 'hi' },
    ])
    return
  })

  it('Includes the history in the prompt', async () => {
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
              content: 'response from the api',
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

    await chat.accept('Hello')
    await chat.accept('hi')

    expect(
      (OpenAIApi.prototype.createChatCompletion as any).args[1][0].messages[3]
        .content
    ).toEqual('Hello')

    expect(
      (OpenAIApi.prototype.createChatCompletion as any).args[1][0].messages[4]
        .content
    ).toEqual('response from the api')

    expect(
      (OpenAIApi.prototype.createChatCompletion as any).args[1][0].messages[5]
        .content
    ).toEqual('hi')
    return
  })
})
