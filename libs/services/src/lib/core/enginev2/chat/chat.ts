import { IAgent } from '../agent/agent'
import { ChatTunedLlm } from '../llm'
import { ChatHistoryItem } from './chathistoryitem'
import { v1 as uuidV1 } from 'uuid'

interface ChatInitializationProps {
  llm: ChatTunedLlm
  agents: IAgent[]
  accountId: string
  workspaceId: string
  userId: string
  clientId: string
}

export default class Chat {
  history: ChatHistoryItem[] = []
  chatId: string = uuidV1().toString()

  constructor(private readonly initializationProps: ChatInitializationProps) {}

  async accept(message: string): Promise<void> {
    this.history.push({
      id: uuidV1().toString(),
      text: message,
      role: 'user',
    })

    let messageToLlm = message

    while (messageToLlm) {
      const llmResponse = await this.initializationProps.llm.accept(
        messageToLlm
      )

      const parsedLlmResponse = this.parseLlmResponse(llmResponse.message)

      this.history.push(parsedLlmResponse)

      if (!parsedLlmResponse.agent) {
        break
      }

      const agent = this.initializationProps.agents.find(
        (agent) => agent.name === parsedLlmResponse.agent?.agentName
      )

      if (!agent) {
        this.history.push({
          id: uuidV1().toString(),
          text: `Agent ${parsedLlmResponse.agent.agentName} not found`,
          role: 'llm',
        })

        break
      }

      const agentResponse = await agent.accept({
        accountId: this.initializationProps.accountId,
        workspaceId: this.initializationProps.workspaceId,
        userId: this.initializationProps.userId,
        clientId: this.initializationProps.clientId,
        prompt: parsedLlmResponse.agent.agentPrompt,
      })

      // Update the history with the agent response
      this.history[this.history.length - 1].agent = {
        agentName: parsedLlmResponse.agent.agentName,
        agentPrompt: parsedLlmResponse.agent.agentPrompt,
        agentResponse: agentResponse,
      }

      if (!agentResponse.data) {
        this.history.push({
          id: uuidV1().toString(),
          text: `Agent ${parsedLlmResponse.agent.agentName} did not return data`,
          role: 'llm',
        })

        break
      }

      messageToLlm = `
        \`\`\`
        {response: ${JSON.stringify(agentResponse.data)}}
        \`\`\`
        `

      this.history.push({
        id: uuidV1().toString(),
        text: messageToLlm,
        role: 'user',
      })
    }
  }

  private parseLlmResponse(llmResponse: string): ChatHistoryItem {
    const agentCallRegex = /```([\s\S]*)```/g
    const agentCallMatch = agentCallRegex.exec(llmResponse)

    if (agentCallMatch && agentCallMatch.length > 1) {
      // Parse the json
      const jsonToParse = agentCallMatch[1].replace(/\n/g, '')
      const agentCallJson = JSON.parse(jsonToParse)
      const agentName = agentCallJson.tool
      const agentPrompt = agentCallJson.instruction

      // Get the text before the agent call
      const textBeforeAgentCall = llmResponse.substring(0, agentCallMatch.index)

      return {
        id: uuidV1().toString(),
        text: textBeforeAgentCall.trim(),
        role: 'llm',
        agent: {
          agentName,
          agentPrompt,
        },
      }
    }

    return {
      id: uuidV1().toString(),
      text: llmResponse,
      role: 'llm',
    }
  }
}
