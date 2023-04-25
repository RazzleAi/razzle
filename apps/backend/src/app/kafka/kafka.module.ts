import { Module } from '@nestjs/common'
import { KafkaClient } from './kafka-client'

@Module({
  exports: [KafkaClient],
  providers: [KafkaClient],
})
export class KafkaModule {}
