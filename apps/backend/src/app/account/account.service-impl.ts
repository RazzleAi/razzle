import { Injectable } from '@nestjs/common'
import { AccountUser, AccountUserInviteEmail } from '@prisma/client'
import { AccountService, ReferenceGenerator } from '@razzle/domain'
import { AppsServiceImpl } from '../apps/apps.service-impl'
import { EmailDispatchGatewayImpl } from '../email/email-dispatch-gateway-impl.service'
import { EventBusImpl } from '../event/event-bus-impl'
import { UserServiceImpl } from '../user/user.service.impl'
import { WorkspaceServiceImpl } from '../workspace/workspace.service-impl'
import { AccountInviteEmailGeneratorImpl } from './account-invite-email-generator'
import { AccountUserInviteEmailRepoImpl } from './account-user-invite-email-repo-impl'
import { AccountUserInviteTokenGeneratorImpl } from './account-user-invite-token-generator-impl'
import { AccountUserInviteTokenRepoImpl } from './account-user-invite-token-repo-impl'
import { AccountRepoImpl } from './account.repo-impl'

@Injectable()
export class AccountServiceImpl extends AccountService {
  constructor(
    accountRepoImpl: AccountRepoImpl,
    accountUserInviteTokenRepoImpl: AccountUserInviteTokenRepoImpl,
    private readonly accountUserInviteEmailRepoImpl: AccountUserInviteEmailRepoImpl,
    workspaceServiceImpl: WorkspaceServiceImpl,
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
      workspaceServiceImpl,
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

    const emailReference = ReferenceGenerator.generate()
    const inviteEmailRef = await this.accountUserInviteEmailRepoImpl.create({
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
