import { Injectable, Logger } from '@nestjs/common'
import { ClientResponse, ClientToEngineRequest } from '@razzle/dto'
import { ClientToEngineMessenger } from '@razzle/services'
import { KafkaClient } from '../../kafka/kafka-client'
import { Producer } from 'kafkajs'
import { MessagingTopics } from './topics'
import { ConnectedClientsImpl } from '../client/connected-clients.impl'

@Injectable()
export class ClientToEngineMessengerImpl implements ClientToEngineMessenger {
  readonly GROUP_ID = 'client-to-engine-messages'
  
  private readonly logger = new Logger(ClientToEngineMessengerImpl.name)
  private readonly kafkaProducer: Producer
  private readonly responseListeners: Map<string, (response: ClientResponse) => Promise<void>> = new Map()
  private readonly requestListeners: ((request: ClientToEngineRequest) => void)[] = []

  constructor(
    kafkaClient: KafkaClient,
    private readonly connectedClients: ConnectedClientsImpl
  ) {
    this.kafkaProducer = kafkaClient.producer({ idempotent: true })
    this.kafkaProducer.connect()
    this.setupConsumer(kafkaClient)
  }

  async sendRequestToEngine(message: ClientToEngineRequest): Promise<void> {
    for (const listener of this.requestListeners) {
      listener(message)
    }
  }

  async sendResponseToClient(
    clientId: string,
    message: ClientResponse
  ): Promise<void> {
    // send to socket, fallback to kafka
    const client = this.connectedClients.getById(clientId)
    let responseCallFailed = false
    if (client) {
      const responseListener = this.responseListeners.get(clientId)
      if (responseListener) {
        try {
          await responseListener(message)
        } catch (err) {
          this.logger.error('Error sending response to client', err)
          responseCallFailed = true
        }
      }      
    }

    // send to kafka topic, let another consumer in the group pick it up
    if (!client || responseCallFailed) {
      await this.kafkaProducer.send({
        topic: MessagingTopics.ENGINE_TO_CLIENT_TOPIC,
        acks: -1,
        messages: [
          {
            value: JSON.stringify(message),
          },
        ],
      })  
    }    
  }

  async onRequestReceivedFromClient(
    callback: (request: ClientToEngineRequest) => void
  ): Promise<void> {
    this.requestListeners.push(callback)
  }

  async onResponseReceivedFromEngine(
    clientId: string,
    callback: (response: ClientResponse) => Promise<void>
  ): Promise<void> {
    this.responseListeners.set(clientId, callback)
  }

  private async setupConsumer(kafkaClient: KafkaClient) {
    const kafkaConsumer = kafkaClient.consumer({
      groupId: this.GROUP_ID,
    })

    await kafkaConsumer.connect()
    await kafkaConsumer.subscribe({
      topics: [MessagingTopics.ENGINE_TO_CLIENT_TOPIC],
      fromBeginning: false,
    })

    await kafkaConsumer.run({
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      eachMessage: async ({ topic, partition, message }) => {
        if (topic === MessagingTopics.ENGINE_TO_CLIENT_TOPIC) {
          const msg = JSON.parse(message.value.toString()) as ClientResponse
          const listener = this.responseListeners.get(msg.clientId)
          if (listener) {
            listener(msg)
          }
        }
      },
    })
  }
}
