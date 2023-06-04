import { OpenAIApi } from 'openai'
import { Gpt3 } from '../gpt3'
import { createSandbox, SinonSandbox } from 'sinon'
import { LlmOpts } from '../llm'

describe('Gpt3', () => {
  let openai: OpenAIApi
  let gpt3: Gpt3
  let sandbox: SinonSandbox

  beforeEach(() => {
    sandbox = createSandbox()
    openai = new OpenAIApi()
    gpt3 = new Gpt3(openai)
  })

  afterEach(() => {
    sandbox.restore()
  })

  it('sends exactly one request to the OpenAI API', () => {
    const acceptSpy = jest.spyOn(openai, 'createCompletion')
    gpt3.accept('Hello')
    expect(acceptSpy).toHaveBeenCalledTimes(1)
  })

  // Using LLM real values for the LLM options so that if they change the test breaks and they have to be made to pass again

  it('sends the exact prompt', () => {
    const acceptSpy = jest.spyOn(openai, 'createCompletion')
    const prompt = 'Hello'
    gpt3.accept(prompt)

    expect(acceptSpy).toHaveBeenCalledWith({
      model: expect.any(String),
      prompt,
      temperature: expect.any(Number),
      top_p: expect.any(Number),
      presence_penalty: expect.any(Number),
      frequency_penalty: expect.any(Number),
      best_of: expect.any(Number),
      n: expect.any(Number),
      stream: expect.any(Boolean),
      stop: expect.any(Array),
    })
  })

  it('uses the correct llm opts', () => {
    const acceptSpy = jest.spyOn(openai, 'createCompletion')
    const prompt = 'Hello'
    const opts: LlmOpts = {
      temperature: 0.5,
      model: 'test-dacinci-003',
      stop: ['\n'],
    }

    gpt3.accept(prompt, opts)

    expect(acceptSpy).toHaveBeenCalledWith({
      model: opts.model,
      prompt,
      temperature: opts.temperature,
      top_p: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
      best_of: 1,
      n: 1,
      stream: false,
      stop: ['\n'],
    })
  })
})
