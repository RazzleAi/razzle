import { ChatCompletionRequestMessage, Configuration, OpenAIApi } from 'openai'
import { ChatTunedLlm, LlmResponse } from './llm'
import { IAgent } from '../agent/agent'
import { Prompt } from '../prompt'

export class ChatGpt implements ChatTunedLlm {
  constructor(
    private readonly openAiApi: OpenAIApi,
    private readonly agents: IAgent[]
  ) {}

  readonly history: ChatCompletionRequestMessage[] = []

  async accept(message: string): Promise<LlmResponse> {
    const agentListPrompt = this.contructAgentListPrompt(this.agents)

    const systemPrompt = new Prompt(
      SYSTEM_PROMPT,
      new Map([['agents', agentListPrompt]])
    )

    this.history.push({ role: 'user', content: message.trim() })

    const messages: ChatCompletionRequestMessage[] = [
      {
        role: 'system',
        content: `${systemPrompt.toString().trim()}`,
      },
    ]

    if (this.history.length > 0) {
      this.history.forEach((message) => {
        messages.push({
          role: message.role,
          content: message.content.trim(),
        })
      })
    }

    messages.push({ role: 'user', content: message.trim() })

    console.log(messages)

    const response = await this.openAiApi.createChatCompletion({
      model: 'gpt-3.5-turbo',
      temperature: 1,
      messages,
    })

    const messageFromChatGpt = response.data.choices[0].message?.content ?? ''

    this.history.push({ role: 'assistant', content: messageFromChatGpt })

    return { message: messageFromChatGpt }
  }

  private contructAgentListPrompt(agents: IAgent[]): string {
    return agents.reduce((prev, curr) => {
      return prev + `${curr.name}:${curr.description}\n`
    }, '')
  }

  public static create(agents: IAgent[]): ChatGpt {
    const openai = new OpenAIApi(
      new Configuration({
        apiKey: process.env.OPENAI_KEY,
      })
    )

    return new ChatGpt(openai, agents)
  }
}

export const SYSTEM_PROMPT = `
You are ConductorGPT,
You're in a group chat with a user and a number of AI agents with different capabilities, the user is primarily talking to you and I need you to interact with the user. The agents in the group chat are there to perform actions or look up information that you can't by yourself so instruct the agents when you need to. When you need to issue an instruction to an agent always write it in the following format markdown code format:

\`\`\`json
{"agent": "<name of the agent you want to instruct>", "instruction": <the instruction to the agent in natural language>}
\`\`\`
Then wait for the user to respond to you with the response from the agent which will also be presented to you in json like this:

\`\`\`json
{"response": <Agent response in JSON format>}
\`\`\`

If an instruction is complex feel free to break it down into multiple instructions to the relevant agents on at a time.

Some important instructions:
- Only use the agents provided to you
- Always write instructions in the format above
- If there are no agents available, tell the user that you don't know how to accomplish the task
- Do not seek confirmation from the user to use an agent
- Do not write responses yourself, wait for the user
- Do not present the user with a summary, just do what they ask
- Do not write instruction to more than one agent at a time and after that write nothing until the user responds
- When a question is asked, check if the answer is in the history and if so, use that answer before asking an agent

Here are the agents and their capabilities:

{agents}
`
