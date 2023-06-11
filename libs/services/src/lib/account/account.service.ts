import {
  CreateAccountDto,
  CreateAccountResponseDto,
  Page,
  PageParams,
} from '@razzle/dto'
import { AccountRepo } from './account.repo'
import { User } from '../user'
import { App, AppsService } from '../apps'
import { ACCOUNT_CREATED_EVENT, EventBus } from '../tools'
import {
  Account,
  AccountInvitation,
  AccountUser,
  AccountWithOwner,
  AccountWithUser,
} from './types'
import { IllegalArgumentException } from '../exceptions/illegal-argument.exception'
import { NotFoundException } from '@nestjs/common'
import { AccountInvitationRepo } from './account-invitation.repo'
import { v4 as uuidv4 } from 'uuid'
import { DateTime } from 'luxon'
import { Emailer } from '../tools/email/emailer'
import Mailgen from 'mailgen'
import { DuplicateResourceException } from '../exceptions'
export class AccountService {
  constructor(
    private readonly accountRepo: AccountRepo,
    private readonly accountInvitationRepo: AccountInvitationRepo,
    private readonly emailer: Emailer,
    private readonly appsService: AppsService,
    private readonly eventBus: EventBus
  ) {}

  async createAccount(
    userId: string,
    createAccountDto: CreateAccountDto
  ): Promise<CreateAccountResponseDto> {
    if (
      createAccountDto.enableDomainMatching &&
      !!createAccountDto.matchDomain
    ) {
      const accountWithMatchDomain =
        await this.accountRepo.getAccountByMatchDomain(
          createAccountDto.matchDomain
        )
      if (accountWithMatchDomain) {
        throw new DuplicateResourceException(
          'An account already exists with this domain.'
        )
      }
    }

    const account = await this.accountRepo.createAccount({
      name: createAccountDto.name,
      ownerId: userId,
      enableDomainMatching: createAccountDto.enableDomainMatching,
      matchDomain: createAccountDto.matchDomain,
    })
    this.eventBus.emit(ACCOUNT_CREATED_EVENT, { ...account, userId })
    return account
  }

  async getById(accountId: string): Promise<AccountWithOwner | null> {
    return this.accountRepo.findById(accountId)
  }

  async getAccountByMatchDomain(domain: string): Promise<Account | null> {
    return this.accountRepo.getAccountByMatchDomain(domain)
  }

  async getUserAccounts(
    userId: string
  ): Promise<(Account & { memberCount: number })[]> {
    const accounts = await this.accountRepo.getUserAccounts(userId)
    const accountIds = accounts.map((account) => account.id)
    const memberCounts = await this.getMemberCountsForAccounts(accountIds)

    return accounts.map((account) => ({
      ...account,
      memberCount: memberCounts[account.id] || 0,
    }))
  }

  async getMemberCountsForAccounts(
    accountIds: string[]
  ): Promise<{ [accountId: string]: number }> {
    const promises = accountIds.map((accountId) =>
      this.getMemberCountForAccount(accountId)
    )
    const memberCounts = await Promise.all(promises)
    const result: { [accountId: string]: number } = {}
    for (let i = 0; i < accountIds.length; i++) {
      result[accountIds[i]] = memberCounts[i]
    }

    return result
  }

  async getMemberCountForAccount(accountId: string): Promise<number> {
    const memberCount = await this.accountRepo.countUsersInAccount(accountId)
    return memberCount
  }

  async inviteMember(
    accountId: string,
    invitorId: string,
    inviteeEmail: string
  ): Promise<AccountInvitation> {
    const invitationToken = uuidv4()
    const expiryDate = DateTime.now().plus({ days: 7 }).toJSDate()
    const invitation = await this.accountInvitationRepo.createAccountInvitation(
      {
        accountId,
        expiryDate,
        invitedByUserId: invitorId,
        inviteeEmail,
        token: invitationToken,
      }
    )

    const emailBody = await this.generateInvitationEmailBody(invitation)
    const subject = `You have been invited to join the ${invitation.account.name} account on Razzle`
    const sent = await this.emailer.sendEmail(inviteeEmail, subject, emailBody)
    if (!sent) {
      // TODO: log this and handle it
    }
    return invitation
  }

  private async generateInvitationEmailBody(
    invitation: AccountInvitation
  ): Promise<string> {
    const mailGen = new Mailgen({
      theme: 'default',
      product: {
        name: 'Razzle',
        link: 'https://getrazzle.com',
        logo: 'https://uploads-ssl.webflow.com/639100b6167ec2e23dd14776/63910d398c56e239eb5f3113_Razzle%20Black%403x.png',
      },
    })
    const email: Mailgen.Content = {
      body: {
        title: 'You have been invited to join a Razzle account',
        intro: [
          `You have been invited to join the ${invitation.account.name} account on Razzle.`,
          invitation.invitedBy
            ? `You were invited by ${invitation.invitedBy.username}`
            : '',
        ],
        action: {
          instructions: `Click the link below to accept the invitation.`,
          button: {
            text: 'Accept Invitation',
            link: `https://app.getrazzle.com/accept-invitation/${invitation.token}`,
          },
        },
      },
    }
    return mailGen.generate(email)
  }

  async addUserToAccount(userId: string, accountId: string) {
    if (!(await this.accountRepo.isUserInAccount(userId, accountId))) {
      await this.accountRepo.addUserToAccount(userId, accountId)
    }
  }

  async getAllUsersInAccount(accountId: string): Promise<User[]> {
    return this.accountRepo.getAllUsersInAccount(accountId)
  }

  async getUsersInAccount(
    accountId: string,
    pageParams: PageParams
  ): Promise<Page<AccountWithUser>> {
    return this.accountRepo.getUsersInAccount(accountId, pageParams)
  }

  async removeUserFromAccount(
    userId: string,
    accountId: string
  ): Promise<boolean> {
    return await this.accountRepo.removeUserFromAccount(userId, accountId)
  }

  public async findAccountUser(
    accountId: string,
    userId: string
  ): Promise<AccountUser> {
    return this.accountRepo.findAccountUser(accountId, userId)
  }

  public async findAccountUserWithOwner(
    accountId: string,
    userId: string
  ): Promise<AccountWithOwner> {
    return this.accountRepo.findAccountUserWithOwner(accountId, userId)
  }

  async getAppsInAccount(accountId: string): Promise<App[]> {
    const account = await this.getById(accountId)
    if (!account) {
      throw new NotFoundException(`Account ${accountId} not found`)
    }

    const accountAppIds = account.accountApps.map(
      (accountApp) => accountApp.appId
    )
    const apps = await this.appsService.findByIds(accountAppIds)

    const createdApps = await this.appsService.getAppsCreatedByAccount(
      accountId
    )

    // dedupe by id
    const appIds = new Set<string>()
    const dedupedApps = [...apps, ...createdApps].filter((app) => {
      if (appIds.has(app.id)) {
        return false
      }
      appIds.add(app.id)
      return true
    })
    return dedupedApps
  }

  async getUnsyncedAppsInAccount(accountId: string): Promise<App[]> {
    const apps = await this.getAppsInAccount(accountId)
    return apps.filter((app) => !app.isDefault && !!app.data == false)
  }

  async addAppToAccount(accountId: string, appId: string): Promise<App | null> {
    const app = await this.appsService.findById(appId)
    if (!app) {
      throw new NotFoundException(`App ${appId} not found`)
    }

    const account = await this.getById(accountId)
    if (!account) {
      throw new NotFoundException(`Account ${accountId} not found`)
    }

    if (app.creatorId === accountId) {
      return app
    }

    await this.accountRepo.addAppToAccount(accountId, appId)

    return app
  }

  async isAppInAccount(accountId: string, appId: string): Promise<boolean> {
    const app = await this.appsService.findById(appId)
    if (!app) {
      throw new NotFoundException(`App ${appId} not found`)
    }

    if (app.creatorId === accountId) {
      return true
    }

    return this.accountRepo.isAppInAccount(accountId, appId)
  }

  async removeAppFromAccount(
    accountId: string,
    appId: string
  ): Promise<boolean> {
    const app = await this.appsService.findById(appId)
    if (!app) {
      throw new NotFoundException(`App ${appId} not found`)
    }

    // can't remove an app if it's the default app or if it's owned by the account
    if (app.isDefault || app.creatorId === accountId) {
      throw new IllegalArgumentException(`Can't remove app ${appId}`)
    }

    await this.accountRepo.removeAppFromAccount(accountId, appId)

    return true
  }
}
