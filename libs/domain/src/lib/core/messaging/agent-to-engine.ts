import { AgentMessage, ServerToAgentMessage } from '@razzle/dto'
import { MessagePublisher, MessageSubscriber } from '../../pubsub'
import { ConnectedAgents } from '../agent'

// export interface AgentToEngineMessenger {
//   sendMessageToEngine(resp: AgentMessage): Promise<void>
//   sendMessageToAgent(
//     appId: string,
//     response: ServerToAgentMessage<AgentMessage>
//   ): Promise<void>
//   onResponseReceivedFromAgent(
//     callback: (response: AgentMessage) => void
//   ): Promise<void>
// }

const ENGINE_TO_AGENT_TOPIC = 'engine-to-agent-messages'

export class AgentToEngineMessenger {
  private readonly responseListeners: ((response: AgentMessage) => void)[] = []

  constructor(
    private readonly connectedAgents: ConnectedAgents,
    private readonly messagePublisher: MessagePublisher,
    private readonly messageSubscriber: MessageSubscriber
  ) {
    this.setupSubscriber()
  }

  async sendMessageToEngine(message: AgentMessage): Promise<void> {
    this.responseListeners.forEach((listener) => listener(message))
  }

  async sendMessageToAgent(
    appId: string,
    message: ServerToAgentMessage<AgentMessage>
  ): Promise<void> {
    // send to socket, fallback to publisher
    const agent = this.connectedAgents.getAgentForAppId(appId)
    let agentCallFailed = false
    if (agent) {
      try {
        await agent.sendMessage(message)
      } catch (err) {
        console.error('Error sending message to agent', err)
        agentCallFailed = true
      }
    }

    // send to publisher topic, let another subscriber pick it up
    if (!agent || agentCallFailed) {
      this.messagePublisher.publishMessage(
        ENGINE_TO_AGENT_TOPIC,
        JSON.stringify(message)
      )
    }
  }

  async onResponseReceivedFromAgent(
    callback: (response: AgentMessage) => void
  ): Promise<void> {
    this.responseListeners.push(callback)
  }

  private async setupSubscriber(): Promise<void> {
    await this.messageSubscriber.subscribeToMessages(
      ENGINE_TO_AGENT_TOPIC,
      async (message) => {
        const parsedMessage = JSON.parse(
          message
        ) as ServerToAgentMessage<AgentMessage>
        const appId = parsedMessage.data?.appId
        if (!appId) {
          console.error('Received message without appId', parsedMessage)
          return
        }
        this.sendMessageToAgent(appId, parsedMessage)
      }
    )
  }
}
