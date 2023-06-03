import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets'
import { Client, ClientLifecycle } from '@razzle/services'
import { IncomingMessage } from 'http'
import { WebSocket } from 'ws'
import { ClientRequestValidatorImpl } from './client-request-validator.impl'
import { ClientHistoryStoreImpl } from './client-history-store.impl'
import { ClientToEngineMessengerImpl } from '../messaging/client-to-engine.impl'
import { ConnectedClientsImpl } from './connected-clients.impl'
import { AccountServiceImpl } from '../../account/account.service-impl'
import { AgentCallerImpl } from '../engine'

@WebSocketGateway({ path: '/client' })
export class ClientGateway implements OnGatewayConnection, ClientLifecycle {
  constructor(
    private readonly connectedClients: ConnectedClientsImpl,
    private readonly clientRequestValidator: ClientRequestValidatorImpl,
    private readonly clientHistoryStore: ClientHistoryStoreImpl,
    private readonly clientToEngineMessenger: ClientToEngineMessengerImpl,
    private readonly accountService: AccountServiceImpl,
    private readonly agentCaller: AgentCallerImpl
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  handleConnection(ws: WebSocket, ...args: IncomingMessage[]) {
    const client = new Client(
      ws,
      this.clientRequestValidator,
      this.clientHistoryStore,
      this.clientToEngineMessenger,
      this.accountService,
      this.agentCaller,
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
