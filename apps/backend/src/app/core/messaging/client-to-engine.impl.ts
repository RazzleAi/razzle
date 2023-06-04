import { Injectable } from '@nestjs/common'
import { ClientToEngineMessenger } from '@razzle/services'
import { ConnectedClientsImpl } from '../client/connected-clients.impl'
import { AwsSQSPubSub } from '../../pub-sub/sqs'

@Injectable()
export class ClientToEngineMessengerImpl extends ClientToEngineMessenger {
  constructor(
    connectedClients: ConnectedClientsImpl,
    messagePublisher: AwsSQSPubSub,
    messageSubscriber: AwsSQSPubSub
  ) {
    super(connectedClients, messagePublisher, messageSubscriber)
  }
}
