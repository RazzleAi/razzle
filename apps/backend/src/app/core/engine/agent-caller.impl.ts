import { Injectable } from '@nestjs/common'
import { AgentCaller } from '@razzle/domain'
import { AgentToEngineMessengerImpl } from '../messaging/agent-to-engine.impl'

@Injectable()
export class AgentCallerImpl extends AgentCaller {
  constructor(agentToEngineMessenger: AgentToEngineMessengerImpl) {
    super(agentToEngineMessenger)
  }
}
