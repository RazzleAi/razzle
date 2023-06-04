import { Injectable } from '@nestjs/common'
import { ChatService } from '@razzle/services'
import { AgentCallerImpl } from '../engine'
import { AccountServiceImpl } from '../../account/account.service-impl'
import { AppsServiceImpl } from '../../apps/apps.service-impl'
import { ChatRepoImpl } from './chat-repo.impl'

@Injectable()
export class ChatServiceImpl extends ChatService {
  constructor(
    accountService: AccountServiceImpl,
    agentCaller: AgentCallerImpl,
    chatRepo: ChatRepoImpl,
    appService: AppsServiceImpl
  ) {
    super(accountService, agentCaller, chatRepo, appService)
  }
}
