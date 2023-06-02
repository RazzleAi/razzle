import { Injectable, Logger } from '@nestjs/common'
import { Cron } from '@nestjs/schedule'
import { AccountUserInviteTokenRepo } from '@razzle/domain'
import { AccountUserInviteTokenRepoImpl } from './account-user-invite-token-repo-impl'

@Injectable()
export class AccountUserInviteExpiryTaskScheduler {
  private readonly logger = new Logger(
    AccountUserInviteExpiryTaskScheduler.name
  )

  constructor(
    private readonly accountUserInviteTokenRepo: AccountUserInviteTokenRepoImpl
  ) {}

  // TODO: Move this to config file
  // @Cron('0 0/1 * 1/1 * *')
  handleCron() {
    this.logger.debug('Commencing Account Invite Expiry Cron..')
    this.accountUserInviteTokenRepo.invalidateExpiredTokens()
  }
}
