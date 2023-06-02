import { Injectable } from '@nestjs/common'
import { RazzleEngine } from '@razzle/domain'
import { ClientToEngineMessengerImpl } from '../messaging/client-to-engine.impl'
import { AgentCallerImpl } from './agent-caller.impl'
import { UserServiceImpl } from '../../user/user.service.impl'
import { AccountServiceImpl } from '../../account/account.service-impl'
import { PromptResolverServiceImpl } from '../../ml/args-extractor.service.impl'

@Injectable()
export class RazzleEngineImpl extends RazzleEngine {
  constructor(
    clientMessenger: ClientToEngineMessengerImpl,
    agentCaller: AgentCallerImpl,
    userService: UserServiceImpl,
    accountService: AccountServiceImpl,
    promptResolverService: PromptResolverServiceImpl
  ) {
    super(
      clientMessenger,
      agentCaller,
      promptResolverService,
      userService,
      accountService
    )
  }
}
