import { Injectable } from '@nestjs/common'
import { Kafka } from 'kafkajs'

@Injectable()
export class KafkaClient extends Kafka {
  constructor() {
    const brokers = process.env.KAFKA_BROKERS
      ? process.env.KAFKA_BROKERS.split(',')
      : ['localhost:9092']
    super({
      clientId: 'razzle-ai-backend',
      brokers,
      ssl: process.env.KAFKA_SSL === 'true',
    })
  }
}
