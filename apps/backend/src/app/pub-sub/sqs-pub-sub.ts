import { Injectable, Logger } from '@nestjs/common'
import { AwsSQSClient } from '../tools/sqs/sqs-client'
import { QueueBasedPubSub } from './pub-sub'
import { Consumer } from 'sqs-consumer'

const pubsubQueueName = `razzle_pubsub_${process.env.NODE_ENV}.fifo`

@Injectable()
export class AwsSQSPubSub extends QueueBasedPubSub {
  private queueUrl: string
  private readonly logger = new Logger(AwsSQSPubSub.name)

  constructor(private readonly sqsClient: AwsSQSClient) {
    super()
    
    this.logger.log('Initializing SQS PubSub')
    this.initQueue()
    this.consumeMessages()
  }

  private async initQueue(): Promise<void> {
    const queueUrls = await this.sqsClient.listQueues('razzle_pubsub_')
    this.logger.log(`Found ${queueUrls.length} queues`, queueUrls)    
    const isPubsubQueue = (url: string) => url.endsWith(pubsubQueueName)
    const pubsubQueueUrl = queueUrls.find(isPubsubQueue)
    this.queueUrl =
      pubsubQueueUrl || (await this.sqsClient.createQueue(pubsubQueueName))
    this.logger.log(`PubSub queue URL: ${this.queueUrl}`)
    this.logger.log('SQS PubSub initialized. Consuming messages...')
    this.consumeMessages()
  }

  override async publishMessage(topic: string, message: string): Promise<void> {
    await this.sqsClient.sendMessage(
      this.queueUrl,
      JSON.stringify({ topic, message })
    )
  }

  async consumeMessages(): Promise<void> {
    this.logger.log('Consuming messages...')
    

    await this.sqsClient.receiveMessages(this.queueUrl, (recvMsg) => {
      this.logger.log('Received message from SQS', recvMsg)
      try {
        const parsedMessage = JSON.parse(recvMsg) as {
          topic: string
          message: string
        }
        const { topic, message } = parsedMessage
        const subscribers = this.subscribers.get(topic) || []
        for (const subscriber of subscribers) {
          subscriber.callback(message)
        }
        this.logger.debug(`Message published to ${subscribers.length} subscribers`)
        return true
      } catch (err) {
        console.error('Error receiving message from SQS', err)
        return false
      }
    })
  }
}
