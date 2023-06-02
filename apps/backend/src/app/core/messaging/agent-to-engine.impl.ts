import { Injectable } from '@nestjs/common'
import { AgentToEngineMessenger } from '@razzle/domain'
import { ConnectedAgentsImpl } from '../agent/connected-agents.impl'
import { AwsSQSPubSub } from '../../pub-sub/sqs-pub-sub'

@Injectable()
export class AgentToEngineMessengerImpl extends AgentToEngineMessenger {
  constructor(
    connectedAgents: ConnectedAgentsImpl,
    messagePublisher: AwsSQSPubSub,
    messageSubscriber: AwsSQSPubSub
  ) {
    super(connectedAgents, messagePublisher, messageSubscriber)
  }
}
