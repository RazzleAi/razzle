import { OpenAIApi } from 'openai'
import { InstructTunedLlm, LlmOpts, LlmResponse } from './llm'

export class Gpt3 implements InstructTunedLlm {
  name = 'Gpt3'
  constructor(private readonly openaiApi: OpenAIApi) {}

  async accept(prompt: string, opts?: LlmOpts): Promise<LlmResponse> {
    try {
      const response = await this.openaiApi.createCompletion({
        model: opts?.model ?? 'text-davinci-003',
        prompt: prompt,
        temperature: opts?.temperature ?? 1,
        top_p: 1,
        presence_penalty: 0,
        frequency_penalty: 0,
        best_of: 1,
        n: 1,
        max_tokens: 256,
        stream: false,
        stop: opts?.stop,
      })

      return { message: response.data.choices[0].text ?? '' }
    } catch (error) {
      console.log(`Error prompting GPT-3: ${JSON.stringify(error)}}`)
      return { message: '', error: 'Error occured' }
    }
  }
}
