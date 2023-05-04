import { OnGatewayConnection, WebSocketGateway } from '@nestjs/websockets'
import { Agent, AgentLifecycle } from '@razzle/services'
import { WebSocket } from 'ws'
import { IncomingMessage } from 'http'
import { WsClosureCodes } from '../../websocket/ws-status-codes'
import { AgentToEngineMessengerImpl } from '../messaging/agent-to-engine.impl'
import { AgentSyncServiceImpl } from './agent-sync.impl'
import { ConnectedAgentsImpl } from './connected-agents.impl'
import { AgentHeaderValidatorImpl } from './header-validator.impl'
import { AgentMessage, ServerToAgentMessage } from '@razzle/dto'

@WebSocketGateway({ path: '/agent' })
export class AgentGateway implements OnGatewayConnection, AgentLifecycle {
  constructor(
    private readonly connectedAgents: ConnectedAgentsImpl,
    private readonly agentHeaderValidator: AgentHeaderValidatorImpl,
    private readonly agentSyncService: AgentSyncServiceImpl,
    private readonly agentToEngineMessenger: AgentToEngineMessengerImpl
  ) {}

  async handleConnection(socket: WebSocket, ...args: IncomingMessage[]) {
    const headers = args[0].headers
    if (!(await this.agentHeaderValidator.validateHeaders(headers))) {
      socket.close(
        WsClosureCodes.STATUS_PROTOCOL_ERROR,
        'Missing or invalid headers. Make sure the app_id and api_key headers are set correctly'
      )
      return
    }

    const app = this.agentHeaderValidator.app
    const agent = new Agent(
      socket,
      app.id,
      app.appId,
      this.agentHeaderValidator,
      this.agentSyncService,
      this.agentToEngineMessenger,
      this
    )
    this.connectedAgents.addAgent(agent, app.appId)    
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onClose(agent: Agent, reason: string, code: number) {
    this.connectedAgents.removeAgent(agent)
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onError(agent: Agent, error: unknown, message: string, type: string) {
    this.connectedAgents.removeAgent(agent)
  }
}
