import { Injectable } from '@nestjs/common'
import { AgentMessage, ServerToAgentMessage } from '@razzle/dto'
import { AgentToEngineMessenger } from '@razzle/services'
import { KafkaClient } from '../../kafka/kafka-client'
import { Producer } from 'kafkajs'
import { MessagingTopics } from './topics'
import { ConnectedAgentsImpl } from '../agent/connected-agents.impl'

@Injectable()
export class AgentToEngineMessengerImpl implements AgentToEngineMessenger {
  readonly GROUP_ID = 'agent-to-engine-messages'

  private readonly kafkaProducer: Producer
  private readonly responseListeners: ((response: AgentMessage) => void)[] = []

  constructor(
    kafkaClient: KafkaClient,
    private readonly connectedAgents: ConnectedAgentsImpl
  ) {
    this.kafkaProducer = kafkaClient.producer({ idempotent: true })
    this.kafkaProducer.connect()
    this.setupConsumer(kafkaClient)
  }

  async sendMessageToEngine(message: AgentMessage): Promise<void> {
    this.responseListeners.forEach((listener) => listener(message))
  }

  async sendMessageToAgent(
    appId: string,
    message: ServerToAgentMessage<AgentMessage>
  ): Promise<void> {
    // send to socket, fallback to kafka
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

    // send to kafka topic, let another consumer in the group pick it up
    if (!agent || agentCallFailed) {
      await this.kafkaProducer.send({
        topic: MessagingTopics.ENGINE_TO_AGENT_TOPIC,
        acks: -1,
        messages: [
          {
            key: appId, // setting the key to App ID tells kafka to use the key as a partition key
            value: JSON.stringify(message),
          },
        ],
      })
    }
  }

  async onResponseReceivedFromAgent(
    callback: (response: AgentMessage) => void
  ): Promise<void> {
    this.responseListeners.push(callback)
  }

  private async setupConsumer(kafkaClient: KafkaClient) {
    const kafkaConsumer = kafkaClient.consumer({
      groupId: this.GROUP_ID,
    })

    await kafkaConsumer.connect()
    await kafkaConsumer.subscribe({
      topics: [MessagingTopics.ENGINE_TO_AGENT_TOPIC],
      fromBeginning: true,
    })

    await kafkaConsumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        if (topic === MessagingTopics.ENGINE_TO_AGENT_TOPIC) {
          const msg = JSON.parse(
            message.value.toString()
          ) as ServerToAgentMessage<AgentMessage>
          const appId = msg.data.appId
          this.sendMessageToAgent(appId, msg)
        }
      },
    })
  }
}
