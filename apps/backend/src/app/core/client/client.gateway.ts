import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets'
import { Client, ClientLifecycle } from '@razzle/services'
import { IncomingMessage } from 'http'
import { WebSocket } from 'ws'
import { ClientRequestValidatorImpl } from './client-request-validator.impl'
import { ClientToEngineMessengerImpl } from '../messaging/client-to-engine.impl'
import { ConnectedClientsImpl } from './connected-clients.impl'
import { ChatServiceImpl } from '../chat/chat-service.impl'

@WebSocketGateway({ path: '/client' })
export class ClientGateway implements OnGatewayConnection, ClientLifecycle {
  constructor(
    private readonly connectedClients: ConnectedClientsImpl,
    private readonly clientRequestValidator: ClientRequestValidatorImpl,    
    private readonly clientToEngineMessenger: ClientToEngineMessengerImpl,
    private readonly chatService: ChatServiceImpl
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(ws: WebSocket, ...args: IncomingMessage[]) {
    const client = new Client(
      ws,
      this.clientRequestValidator,
      this.clientToEngineMessenger,
      this.chatService,
      this
    )
    this.connectedClients.add(client)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClientClose(client: Client, reason: string, code: number) {
    this.connectedClients.remove(client)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClientError(client: Client, error: unknown, message: string, type: string) {
    this.connectedClients.remove(client)
  }

  onClientIdentified(oldId: string, client: Client): void {
    this.connectedClients.identify(oldId, client)
  }
}
