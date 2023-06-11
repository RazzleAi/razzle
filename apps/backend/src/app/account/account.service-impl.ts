import { Injectable } from '@nestjs/common'
import {
  AccountService,
} from '@razzle/services'
import { AppsServiceImpl } from '../apps/apps.service-impl'
import { EventBusImpl } from '../tools/event/event-bus-impl'
import { AccountRepoImpl } from './account.repo-impl'
import { AccountInvitationRepoImpl } from './account-invitation.repo.impl'
import { EmailerImpl } from '../tools/email/emailer.impl'

@Injectable()
export class AccountServiceImpl extends AccountService {
  constructor(
    accountRepo: AccountRepoImpl,
    accountInvitationRepo: AccountInvitationRepoImpl,
    emailer: EmailerImpl,
    appsServiceImpl: AppsServiceImpl,
    eventBus: EventBusImpl
  ) {
    super(
      accountRepo,
      accountInvitationRepo,
      emailer,
      appsServiceImpl,
      eventBus
    )
  }

}
