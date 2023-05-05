import { WebSocket, MessageEvent, CloseEvent, ErrorEvent } from 'ws'
import { AgentLifecycle } from './agent-lifecycle'
import { Md5 } from 'ts-md5'
import {
  AgentMessage,
  AgentSyncDto,
  AgentSyncDtoValidator,
  AgentToServerMessage,
  ServerToAgentMessage,
} from '@razzle/dto'
import { AgentHeaderValidator } from './header-validator'
import { AgentSyncService } from './agent-sync'
import { AgentToEngineMessenger } from '../messaging'

export class Agent {
  id: string

  constructor(
    private readonly ws: WebSocket,
    readonly appId: string,
    readonly razzleAppId: string,
    private readonly headerValidator: AgentHeaderValidator,
    private readonly syncService: AgentSyncService,
    private readonly agentToEgineMessenger: AgentToEngineMessenger,
    private readonly lifecycleHandler?: AgentLifecycle
  ) {
    this.generateId()
    console.debug(`Agent connected with id ${this.id}`)

    this.ws.onmessage = this.onWsMessage.bind(this)
    this.ws.onclose = this.onWsClose.bind(this)
    this.ws.onerror = this.onWsError.bind(this)
    this.ws.on('ping', () => {
      this.ws.pong('pong')
    })
  }

  public async sendMessage(message: ServerToAgentMessage<AgentMessage>): Promise<void> {
    return new Promise((res, rej) => {
      this.ws.send(JSON.stringify(message), (err) => {
        if (err) {
          console.error(`Agent.sendMessage: Error sending message: ${err}`)
          rej(err)
          return
        }
        
        res()
      })
    })
    
  }

  private async onWsMessage(messageEvent: MessageEvent) {
    const { data } = messageEvent

    const message = JSON.parse(
      data.toString()
    ) as AgentToServerMessage<AgentMessage>

    const payload = message.data
    if (!payload) {
      console.warn('Agent.onWsMessage: Missing payload in message')
      return
    }

    const isValid = await this.validatePayload(payload)
    if (!isValid) {
      return
    }

    this.handleMessageTypes(message)
  }

  private async handleMessageTypes(
    message: AgentToServerMessage<AgentMessage>
  ): Promise<void> {
    if (message.data) {
      message.data.appId = this.appId
    }

    switch (message.event) {
      case 'SyncApp': {
        const res = await this.handleAgentSync(message.data?.payload)
        const response = {
          event: 'SyncAppResponse',
          data: {
            headers: message.data?.headers,
            payload: res,
          },
        } as ServerToAgentMessage<AgentMessage>
        this.sendMessage(response)
        break
      }
      case 'FuncResponse': {
        if (!message.data) {
          console.warn('Agent.handleMessageTypes: Missing payload in message')
          return
        }
        this.handleFuncResponse(message)
        break
      }
      //   case 'AuthenticateResponse': {
      //     await this.handleAuthenticationResponse(message)
      //     break
      //   }
      //   case 'UserAppAuthentication': {
      //     await this.handleUserAppAuthentication(message)
      //     break
      //   }
    }
  }

  private async validatePayload(payload: AgentMessage): Promise<boolean> {
    if (!payload.headers) {
      console.warn('Agent.validatePayload: Missing headers in payload')
      return false
    }

    const isValid = await this.headerValidator.validateHeaders(payload.headers)
    if (!isValid) {
      // ignore unauthorized messages
      console.debug(
        'Agent.validatePayload: Unauthorized message. Missing app_id or api_key headers'
      )
      return false
    }

    return true
  }

  async handleAgentSync(payload: unknown): Promise<Record<string, unknown>> {
    const { valid, error } = await this.validateSyncPayload(payload)
    if (!valid) {
      console.error('Agent.handleAgentSync: Invalid payload', error)
      return {
        success: false,
        error: error,
      }
    }

    try {
      await this.syncService.syncAgent(this.appId, payload as AgentSyncDto)
    } catch (e) {
      console.error(e)
      return {
        success: false,
        error: e,
      }
    }

    return {
      success: true,
    }
  }

  private async handleFuncResponse(
    message: AgentToServerMessage<AgentMessage>
  ) {
    if (!message.data) {
      console.warn('Agent.handleFuncResponse: Missing payload in message')
      return
    }
    this.agentToEgineMessenger.sendMessageToEngine(message.data)
  }

  private async handleUserAppAuthentication(
    message: AgentToServerMessage<AgentMessage>
  ) {
    // TODO
  }

  private async handleAuthenticationResponse(
    message: AgentToServerMessage<AgentMessage>
  ) {
    // TODO
  }

  private async validateSyncPayload(
    payload: any
  ): Promise<{ valid: boolean; error?: string }> {
    const validator = new AgentSyncDtoValidator()
    return validator.validateData(payload)
  }

  private onWsClose(closeEvent: CloseEvent) {
    const { reason, code } = closeEvent
    console.debug(
      `Agent: Closing connection to ${this.id} due to "${reason}. Code: ${code}"`
    )
    this.lifecycleHandler?.onClose(this, reason, code)
  }

  private onWsError(errorEvent: ErrorEvent) {
    const { error, message, type } = errorEvent
    console.error(`Agent: WS Error occurred: `, { error, message, type })
    this.lifecycleHandler?.onError(this, error, message, type)
  }

  private generateId() {
    this.id = new Md5()
      .appendStr(new Date().getTime().toString())
      .end() as string
  }
}
