import { Workspace } from '@prisma/client'
import {
  CreateAccountDto,
  CreateAccountResponseDto,
  Page,
  PageParams,
} from '@razzle/dto'
import { WorkspaceService } from '../workspace'
import { AccountUserInviteTokenRepo } from './account-user-invite-token-repo'
import { AccountRepo } from './account.repo'
import { DuplicateMatchDomainException } from './exceptions'
import { AccountUserInviteTokenGenerator } from './account-invite-token-generator'
import { EmailDispatchGateway } from '../email/email-dispatch-gateway.service'
import { User, UserService } from '../user'
import { App, AppNotFoundException, AppsService } from '../apps'
import { ACCOUNT_CREATED_EVENT, EventBus } from '../event'
import {
  Account,
  AccountUser,
  AccountWithOwner,
  AccountWithUser,
} from './types'
import { IllegalArgumentException } from '../exceptions/illegal-argument.exception'

export class AccountService {
  constructor(
    protected readonly accountRepo: AccountRepo,
    protected readonly accountUserInviteTokenRepo: AccountUserInviteTokenRepo,
    protected readonly userService: UserService,
    protected readonly workspaceService: WorkspaceService,
    protected readonly accountUserInviteTokenGenerator: AccountUserInviteTokenGenerator,
    protected readonly emailDispatchGateway: EmailDispatchGateway,
    protected readonly appsService: AppsService,
    protected readonly eventBus: EventBus
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
        throw new DuplicateMatchDomainException(
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
    await this.createDefaultWorkspaceForAccount(account, userId)
    this.eventBus.emit(ACCOUNT_CREATED_EVENT, { ...account, userId })
    return account
  }

  // TODO: DELETE THIS AFTER DEPLOYMENT TO PROD
  async getByName(name: string): Promise<Account | null> {
    return this.accountRepo.getByName(name)
  }

  async getById(accountId: string): Promise<AccountWithOwner | null> {
    return this.accountRepo.findById(accountId)
  }

  async getAccountsByOwner(ownerId: string): Promise<AccountWithOwner[]> {
    return this.accountRepo.getAccountsByOwnerId(ownerId)
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

  async addUserToAccount(userId: string, accountId: string) {
    if (!(await this.accountRepo.isUserInAccount(userId, accountId))) {
      await this.accountRepo.addUserToAccount(userId, accountId)
      await this.addUserToDefaultWorkspaceForAccount(userId, accountId)
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
    // remove user from all workspaces
    const workspaces = await this.workspaceService.getWorkspacesForAccount(
      accountId
    )
    for (const workspace of workspaces) {
      await this.workspaceService.removeUserFromWorkspace(userId, workspace.id)
    }
    return await this.accountRepo.removeUserFromAccount(userId, accountId)
  }

  private async createDefaultWorkspaceForAccount(
    account: Account,
    userId: string
  ): Promise<Workspace> {
    const result = await this.workspaceService.createWorkspaceWithUser(
      {
        accountId: account.id,
        name: `${account.name}-default`,
        description: `Default workspace for ${account.name}`,
        isDefault: true,
      },
      userId
    )
    return result.workspace
  }

  private async addUserToDefaultWorkspaceForAccount(
    userId: string,
    accountId: string
  ) {
    const account = await this.getById(accountId)
    if (!account) {
      throw new Error(`Account ${accountId} not found`)
    }

    const defaultWorkspace = await this.findDefaultWorkspaceForAccount(account)
    if (defaultWorkspace) {
      await this.workspaceService.addUserToWorkspace(
        userId,
        defaultWorkspace.id
      )
    }
  }

  private async findDefaultWorkspaceForAccount(
    account: Account
  ): Promise<Workspace | null> {
    const workspaces = await this.workspaceService.getWorkspacesForAccount(
      account.id
    )
    const defaultWorkspace = workspaces.find(
      (w) => w.isDefault || w.name === `${account.name}-default`
    )
    return defaultWorkspace || null
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
    // also get apps installed in the workspaces
    const workspaces = await this.workspaceService.getWorkspacesForAccount(
      accountId
    )
    const apps: App[] = []
    for (const workspace of workspaces) {
      const workspaceApps = await this.workspaceService.getAppsInWorkspace(
        workspace.id
      )
      apps.push(...workspaceApps)
    }

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
    const app = await this.appsService.getById(appId)
    if (!app) {
      throw new AppNotFoundException(`App ${appId} not found`)
    }

    const workspaces = await this.workspaceService.getWorkspacesForAccount(
      accountId
    )

    for (const workspace of workspaces) {
      await this.workspaceService.addAppToWorkspace(appId, workspace.id)
    }
    return app
  }

  async isAppInAccount(accountId: string, appId: string): Promise<boolean> {
    const workspaces = await this.workspaceService.getWorkspacesForAccount(
      accountId
    )
    const app = await this.appsService.getById(appId)
    if (!app) {
      throw new AppNotFoundException(`App ${appId} not found`)
    }

    if (app.creatorId === accountId) {
      return true
    }

    for (const workspace of workspaces) {
      if (await this.workspaceService.isAppInWorkspace(workspace.id, appId)) {
        return true
      }
    }

    return false
  }

  async removeAppFromAccount(
    accountId: string,
    appId: string
  ): Promise<boolean> {
    const app = await this.appsService.getById(appId)
    if (!app) {
      throw new AppNotFoundException(`App ${appId} not found`)
    }

    // can't remove an app if it's the default app or if it's owned by the account
    if (app.isDefault || app.creatorId === accountId) {
      throw new IllegalArgumentException(`Can't remove app ${appId}`)
    }

    const workspaces = await this.workspaceService.getWorkspacesForAccount(
      accountId
    )
    for (const workspace of workspaces) {
      await this.workspaceService.removeAppFromWorkspace(appId, workspace.id)
    }
    return true
  }

  // TODO: DELETE THESE
  async deleteAccountByName(accountName: string): Promise<void> {
    const account = await this.getByName(accountName)
    if (!account) {
      throw new Error(`Account ${accountName} not found`)
    }

    const workspaces = await this.workspaceService.getWorkspacesForAccount(
      account.id
    )
    for (const workspace of workspaces) {
      await this.workspaceService.forceDeleteWorkspace(workspace.id)
    }

    await this.accountRepo.deleteAccount(account.id)
  }

  async forceRemoveUserFromAccount(
    userId: string,
    accountId: string
  ): Promise<boolean> {
    
    return await this.accountRepo.forceRemoveUserFromAccount(userId, accountId)
  }
}
