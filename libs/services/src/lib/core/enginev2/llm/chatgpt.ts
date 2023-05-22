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
    const basePrompt = new Prompt(
      BASE_PROMPT,
      new Map([['agents', agentListPrompt]])
    )

    this.history.push({ role: 'user', content: message })

    const response = await this.openAiApi.createChatCompletion({
      model: 'davinci',
      temperature: 0.5,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: basePrompt.toString() },
        { role: 'assistant', content: INIT_MESSAGE },
        ...this.history,
        { role: 'user', content: message },
      ],
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

export const INIT_MESSAGE = `
'Hello! How can I assist you today?'
`

export const SYSTEM_PROMPT = `
You are AgentInstructorGPT, your job is to give instructions to agents in  other to have conversations with a user
`

export const BASE_PROMPT = `
Your main task to talk to the user and carry out their wishes while using the agents provided for fulfilling this goal.
For complex instructions, you can break the instructions down into sub instructions and instruct the agents to perform these instructions.
When you need to issue an instruction to an agent present that to the user in json using the format below:

\`\`\`
{"tool": "<name of the tool you want to instruct>", "instruction": <the instruction you want to pass in natural language>}
\`\`\`
Then wait for the user to respond to you with the response from the agent which will also be presented to you in json like this:
\`\`\`
{"response": <Agent response in JSON format>}
\`\`\`
Always wait for the user to present you with the agent response before presenting the next agent instruction, do not write it yourself

Some important instructions:
- If there are no agents available, tell the user that you don't know how to accomplish the task
- Do not seek confirmation from the user to use an agent
- Do not write responses yourself, wait for the user
- Do not present the user with a summary, just do what they ask
- Do not write instruction to more than one agent at a time and after that write nothing until the user responds

Here are the agents:
{agents}
`
