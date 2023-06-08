import { Module } from '@nestjs/common'
import { AwsSQSClient } from './sqs/sqs-client'
import { MixpanelEventTracker } from './analytics/mixpanel-event-tracker'
import { NestLogger } from './logging/nestjs-logger'
import { EventBusImpl } from './event/event-bus-impl'
import { KafkaClient } from './kafka/kafka-client'
import { AwsSQSPubSub } from './pub-sub/sqs'

@Module({  
  exports: [
    AwsSQSClient,
    MixpanelEventTracker,
    AwsSQSPubSub,
    NestLogger,
    EventBusImpl,
  ],
  providers: [
    KafkaClient,
    AwsSQSClient,
    MixpanelEventTracker,
    NestLogger,
    EventBusImpl,
    AwsSQSPubSub,
  ],
})
export class ToolsModule {}
