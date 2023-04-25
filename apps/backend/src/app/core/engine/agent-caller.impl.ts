import { Injectable } from '@nestjs/common'
import { AgentCaller } from '@razzle/services'
import { AgentToEngineMessengerImpl } from '../messaging/agent-to-engine.impl'

@Injectable()
export class AgentCallerImpl extends AgentCaller {
  constructor(agentToEngineMessenger: AgentToEngineMessengerImpl) {
    super(agentToEngineMessenger)
  }
}
