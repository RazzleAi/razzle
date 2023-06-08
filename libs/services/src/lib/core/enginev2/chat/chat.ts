import { IAgent } from '../agent/agent'
import { ChatLlmHistoryItem, ChatTunedLlm } from '../llm'
import { ChatHistoryItem } from './chathistoryitem'
import { v1 as uuidV1 } from 'uuid'
import { IChat } from './chatinterface'

interface ChatInitializationProps {
  llm: ChatTunedLlm
  agents: IAgent[]
  accountId: string
  workspaceId: string
  userId: string
  clientId: string
  chatId?: string
  agentChatLoopLimit?: number
}

export default class Chat {
  history: ChatHistoryItem[] = []
  chatId: string
  constructor(readonly initializationProps: ChatInitializationProps) {
    this.chatId = initializationProps.chatId ?? uuidV1().toString()
  }

  async *accept(message: string) {
    const acceptedMessageId = uuidV1().toString()
    const acceptedMessage: ChatHistoryItem = {
      id: acceptedMessageId,
      text: message,
      role: 'user',
      timestamp: Date.now(),
    }

    this.history.push(acceptedMessage)

    yield acceptedMessage

    let messageToLlm = message
    let numberOfAgentCalls = 0

    while (messageToLlm) {
      const llmResponse = await this.initializationProps.llm.accept(
        messageToLlm,
        this.historyToLLmHistory()
      )

      const parsedLlmResponse = this.parseLlmResponse(llmResponse.message)
      const parsedLmResponseToHistory = {
        ...parsedLlmResponse,
        rawLmResponse: llmResponse.message,
      }

      this.history.push(parsedLmResponseToHistory)
      yield parsedLmResponseToHistory

      if (!parsedLlmResponse.agent) {
        break
      }

      const agent = this.initializationProps.agents.find(
        (agent) => agent.name === parsedLlmResponse.agent?.agentName
      )

      if (!agent) {
        const historyObj: ChatHistoryItem = {
          id: uuidV1().toString(),
          text: `Agent ${parsedLlmResponse.agent.agentName} not found`,
          role: 'llm',
          timestamp: Date.now(),
        }

        this.history.push(historyObj)
        yield historyObj

        break
      }

      const agentCallLimit = this.initializationProps.agentChatLoopLimit ?? 10

      if (numberOfAgentCalls >= agentCallLimit) {
        const historyObj: ChatHistoryItem = {
          id: uuidV1().toString(),
          text: `Hey! It looks like I would not fulfil that request, maybe try and rephrase your prompt`,
          role: 'llm',
          timestamp: Date.now(),
        }

        this.history.push(historyObj)
        yield historyObj

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

      numberOfAgentCalls++

      yield this.history[this.history.length - 1]

      if (!agentResponse.data) {
        const historyObj: ChatHistoryItem = {
          id: uuidV1().toString(),
          text: `Agent ${parsedLlmResponse.agent.agentName} did not return data`,
          role: 'llm',
          timestamp: Date.now(),
        }

        this.history.push(historyObj)
        yield historyObj
        break
      }

      messageToLlm = `
        \`\`\`json
        {response: ${JSON.stringify(agentResponse.data)}}
        \`\`\`
        `
    }
  }

  private parseLlmResponse(llmResponse: string): ChatHistoryItem {
    console.log(`Parsing LLM response: ${llmResponse}`)
    // Get string wraped in markdown codeblock  ```json ```
    const agentCallRegex = /```json([\s\S]*)```/gm
    const agentCallMatch = agentCallRegex.exec(llmResponse)

    if (agentCallMatch && agentCallMatch.length > 1) {
      // Parse the json
      const jsonToParse = agentCallMatch[1].replace(/\n/g, '')
      console.log(`Json to parse: ${jsonToParse}`)
      const agentCallJson = JSON.parse(jsonToParse)
      const agentName = agentCallJson.agent
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
        timestamp: Date.now(),
      }
    }

    return {
      id: uuidV1().toString(),
      text: llmResponse,
      role: 'llm',
      timestamp: Date.now(),
    }
  }

  historyToLLmHistory(): ChatLlmHistoryItem[] {
    return this.history.slice(0, -1).map((item) => {
      return {
        content: item.rawLmResponse ?? item.text,
        role: item.role,
      }
    })
  }

  serialize(): IChat {
    return {
      chatId: this.chatId,
      history: this.history,
      initializationProps: {
        llm: {
          name: this.initializationProps.llm.name,
        },
        agents: this.initializationProps.agents.map((agent) => agent.id),
        accountId: this.initializationProps.accountId,
        workspaceId: this.initializationProps.workspaceId,
        userId: this.initializationProps.userId,
        clientId: this.initializationProps.clientId,
      },
    }
  }
}
