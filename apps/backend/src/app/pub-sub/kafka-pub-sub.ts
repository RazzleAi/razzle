import { Injectable } from '@nestjs/common'
import { KafkaClient } from '../tools/kafka/kafka-client'
import { Producer } from 'kafkajs'
import { QueueBasedPubSub } from './pub-sub'

@Injectable()
export class KafkaPubSub extends QueueBasedPubSub {
  private readonly kafkaProducer: Producer

  constructor(private readonly kafkaClient: KafkaClient) {
    super()
    this.kafkaProducer = this.kafkaClient.producer({ idempotent: true })
    this.kafkaProducer.connect()
    this.consume()
  }

  async publishMessage(topic: string, message: string): Promise<void> {
    await this.kafkaProducer.send({
      topic: `razzle.kafka.${topic}`,
      messages: [{ value: message }],
    })
  }

  async consume(): Promise<void> {
    const kafkaConsumer = this.kafkaClient.consumer({
      groupId: 'razzle-kafka-messages-group',
    })
    await kafkaConsumer.connect()
    await kafkaConsumer.subscribe({
      topic: /razzle\.kafka\./i,
      fromBeginning: true,
    })
    await kafkaConsumer.run({
      eachMessage: async ({ topic, message }) => {
        const topicName = topic.replace('razzle.kafka.', '')
        const subscribers = this.subscribers.get(topicName) || []
        for (const subscriber of subscribers) {
          subscriber.callback(message.value.toString())
        }
      },
    })
  }
}
