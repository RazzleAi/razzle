import { Module } from '@nestjs/common'
import { AwsSQSClient } from './sqs/sqs-client'
import { MixpanelEventTracker } from './analytics/mixpanel-event-tracker'
import { NestLogger } from './logging/nestjs-logger'
import { EventBusImpl } from './event/event-bus-impl'
import { KafkaClient } from './kafka/kafka-client'
import { AwsSQSPubSub } from './pub-sub/sqs'
import { EmailerImpl } from './email/emailer.impl'

@Module({  
  exports: [
    AwsSQSClient,
    MixpanelEventTracker,
    AwsSQSPubSub,
    NestLogger,
    EventBusImpl,
    EmailerImpl,
  ],
  providers: [
    KafkaClient,
    AwsSQSClient,
    MixpanelEventTracker,
    NestLogger,
    EventBusImpl,
    AwsSQSPubSub,
    EmailerImpl,
  ],
})
export class ToolsModule {}
