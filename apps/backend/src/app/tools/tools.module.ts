import { Module } from '@nestjs/common'
import { KafkaClient } from '../tools/kafka/kafka-client'
import { AwsSQSClient } from './sqs/sqs-client'

@Module({
  exports: [KafkaClient, AwsSQSClient],
  providers: [KafkaClient, AwsSQSClient],
})
export class ToolsModule {}
