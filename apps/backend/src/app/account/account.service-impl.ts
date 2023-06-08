import { Injectable } from '@nestjs/common'
import { AccountUser, AccountUserInviteEmail } from '@prisma/client'
import { AccountService } from '@razzle/services'
import { AppsServiceImpl } from '../apps/apps.service-impl'
import { EmailDispatchGatewayImpl } from '../email/email-dispatch-gateway-impl.service'
import { EventBusImpl } from '../event/event-bus-impl'
import { UserServiceImpl } from '../user/user.service.impl'
import { AccountInviteEmailGeneratorImpl } from './account-invite-email-generator'
import { AccountUserInviteEmailRepoImpl } from './account-user-invite-email-repo-impl'
import { AccountUserInviteTokenGeneratorImpl } from './account-user-invite-token-generator-impl'
import { AccountUserInviteTokenRepoImpl } from './account-user-invite-token-repo-impl'
import { AccountRepoImpl } from './account.repo-impl'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class AccountServiceImpl extends AccountService {
  constructor(
    accountRepoImpl: AccountRepoImpl,
    accountUserInviteTokenRepoImpl: AccountUserInviteTokenRepoImpl,
    private readonly accountUserInviteEmailRepoImpl: AccountUserInviteEmailRepoImpl,
    accountUserInviteTokenGeneratorImpl: AccountUserInviteTokenGeneratorImpl,
    emailDispatchGatewayImpl: EmailDispatchGatewayImpl,
    userServiceImpl: UserServiceImpl,
    appsServiceImpl: AppsServiceImpl,
    eventBus: EventBusImpl
  ) {
    super(
      accountRepoImpl,
      accountUserInviteTokenRepoImpl,
      userServiceImpl,
      accountUserInviteTokenGeneratorImpl,
      emailDispatchGatewayImpl,
      appsServiceImpl,
      eventBus
    )
  }

  public async inviteUserToAccount(
    accountOwner: AccountUser,
    emailInvitee: string
  ) {
    let token =
      await this.accountUserInviteTokenRepo.findValidTokenByAccountIdAndEmail(
        accountOwner.accountId,
        emailInvitee
      )
    token =
      token ||
      (await this.accountUserInviteTokenRepo.createToken(
        this.accountUserInviteTokenGenerator.generateInviteToken(
          accountOwner,
          emailInvitee
        )
      ))

    const emailReference = `${uuidv4()}-${new Date().getTime()}-${uuidv4()}`
    await this.accountUserInviteEmailRepoImpl.create({
      emailReference,
      accountUserInviteTokenId: token.id,
    } as AccountUserInviteEmail)

    this.emailDispatchGateway.dispatchEmail(
      new Map([
        ['to', emailInvitee],
        ['type', AccountInviteEmailGeneratorImpl.TYPE],
        ['token', token.token],
        ['reference', emailReference],
      ])
    )
  }
}
