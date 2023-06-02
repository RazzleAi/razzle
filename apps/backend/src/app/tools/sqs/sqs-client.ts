import { Injectable, Logger } from '@nestjs/common'
// import * as AWS from 'aws-sdk'
import {
  ListQueuesCommand,
  CreateQueueCommand,
  SQSClient,
  SendMessageCommandInput,
  SendMessageCommand,
  ListQueuesCommandInput,
} from '@aws-sdk/client-sqs'
import { Consumer } from 'sqs-consumer'

@Injectable()
export class AwsSQSClient {
  private logger = new Logger(AwsSQSClient.name)
  private sqs: SQSClient

  constructor() {
    this.sqs = new SQSClient({
      apiVersion: '2012-11-05',
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })
  }

  async listQueues(queueNamePrefix?: string): Promise<string[]> {
    const input: ListQueuesCommandInput = {}
    if (queueNamePrefix) {
      input.QueueNamePrefix = queueNamePrefix
    }
    const listQueuesCommand = new ListQueuesCommand(input)
    const result = await this.sqs.send(listQueuesCommand)
    return result.QueueUrls || []
  }

  async createQueue(name: string): Promise<string | null> {
    this.logger.log(`Creating queue ${name}`)
    const createQueueCommand = new CreateQueueCommand({
      QueueName: name,
      Attributes: {
        DelaySeconds: '0',
        FifoQueue: 'true',
        ContentBasedDeduplication: 'true',
      },
    })
    const result = await this.sqs.send(createQueueCommand)
    this.logger.log(`Created queue ${name}`, result)
    return result.QueueUrl || null
  }

  async sendMessage(
    queueUrl: string,
    message: string,
    deduplicationId?: string
  ): Promise<string> {
    const input: SendMessageCommandInput = {
      MessageBody: message,
      QueueUrl: queueUrl,
      DelaySeconds: 0,
    }
    if (deduplicationId) {
      input.MessageDeduplicationId = deduplicationId
    }
    const command = new SendMessageCommand(input)
    const response = await this.sqs.send(command)
    return response.MessageId || ''
  }

  async receiveMessages(
    queueUrl: string,
    callback: (message: string) => boolean | Promise<boolean>
  ): Promise<void> {
    const consumer = Consumer.create({
      queueUrl: queueUrl,
      handleMessage: async (message) => {
        const msgBody = message.Body
        const cbRes = await callback(msgBody)
        this.logger.log(`Message processed: ${cbRes}`)
      },
    })
    consumer.start()    
  }

}
