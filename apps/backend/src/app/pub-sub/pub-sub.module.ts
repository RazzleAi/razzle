import { Module } from '@nestjs/common'
import { AwsSQSPubSub } from './sqs'
import { ToolsModule } from '../tools/tools.module'

export const PUB_SUB_PUBLISHER = 'PUB_SUB_PUBLISHER'
export const PUB_SUB_SUBSCRIBER = 'PUB_SUB_SUBSCRIBER'

@Module({
  imports: [ToolsModule],
  exports: [AwsSQSPubSub],
  providers: [
    AwsSQSPubSub,
  ],
})
export class PubSubModule {}
