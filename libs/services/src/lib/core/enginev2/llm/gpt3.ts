import { OpenAIApi } from 'openai'
import { Llm, LlmOpts, LlmResponse } from './llm'

export class Gpt3 implements Llm {
  constructor(private readonly openaiApi: OpenAIApi) {}

  async accept(message: string, opts?: LlmOpts): Promise<LlmResponse> {
    const response = await this.openaiApi.createCompletion({
      model: opts?.model || 'test-davinci-003',
      prompt: message,
      temperature: opts?.temperature || 1,
      top_p: 1,
      presence_penalty: 0,
      frequency_penalty: 0,
      best_of: 1,
      n: 1,
      stream: false,
      stop: opts?.stop || [],
    })

    return { message: response.data.choices[0].text ?? '' }
  }
}
