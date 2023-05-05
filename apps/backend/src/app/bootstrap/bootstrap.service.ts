import { Injectable, Logger } from '@nestjs/common'
import { App, DefaultAppData, User } from '@razzle/services'
import { AccountServiceImpl } from '../account/account.service-impl'
import { AppsServiceImpl } from '../apps/apps.service-impl'
import { DefaultAppsServiceImpl } from '../default-apps/default-apps.service-impl'
import { UserServiceImpl } from '../user/user.service.impl'
import { AuthServiceImpl } from '../auth/auth.service-impl'
import { WorkspaceServiceImpl } from '../workspace/workspace.service-impl'

@Injectable()
export class BootstrapService {
  private logger = new Logger(BootstrapService.name)

  constructor(
    private readonly userService: UserServiceImpl,
    private readonly accountService: AccountServiceImpl,
    private readonly appsService: AppsServiceImpl,
    private readonly authService: AuthServiceImpl,
    private readonly defaultApps: DefaultAppsServiceImpl,
    private readonly workspaceService: WorkspaceServiceImpl
  ) {}

  onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      return
    }

    this.cleanupDb()
  }

  // TODO: DELETE AFTER CLEANUP IN PROD
  /**
   * This function is used to clean up old usernames which were just a copy of emails. new usernames areextracted from the users emails
   */
  private async cleanupDb() {
    try {
      const appsToDelete: App[] = []
      const workspaceManager = await this.appsService.getByAppId(
        'razzle-workspace-manager'
      )
      if (!workspaceManager) {
        this.logger.warn('Cleanup: Workspace manager app not found')
      } else {
        appsToDelete.push(workspaceManager)
      }

      const accountManager = await this.appsService.getByAppId(
        'razzle-account-manager'
      )
      if (!accountManager) {
        this.logger.warn('Cleanup: Account manager app not found')
      } else {
        appsToDelete.push(accountManager)
      }

      const defaultAccount = await this.accountService.getByName(
        'razzle-default-account'
      )
      let defaultUsers: User[] = []
      if (defaultAccount) {
        defaultUsers = await this.accountService.getAllUsersInAccount(
          defaultAccount.id
        )
      }

      // get all avaibalbe workspaces
      const workspaces = await this.workspaceService.getAllWorkspaces()
      for (const workspace of workspaces) {
        for (const user of defaultUsers) {
          const workspaceUsers =
            await this.workspaceService.getAllUsersInWorkspace(workspace.id)
          if (!workspaceUsers.find((u) => u.id === user.id)) {
            continue
          }
          try {
            await this.workspaceService.removeUserFromWorkspace(
              user.id,
              workspace.id
            )
          } catch (err) {
            console.warn('Error removing user from workspace', err)
          }
        }

        for (const app of appsToDelete) {
          const isAppInWorkspace = await this.workspaceService.isAppInWorkspace(
            workspace.id,
            app.id
          )
          if (!isAppInWorkspace) {
            continue
          }

          await this.workspaceService.removeAppFromWorkspace(
            app.id,
            workspace.id
          )
        }
      }

      for (const app of appsToDelete) {
        await this.appsService.forceDeleteApp(app.id)
      }

      if (defaultAccount) {
        // get workspaces for account
        const workspaces =
          await this.workspaceService.getAllWorkspacesForAccount(
            defaultAccount.id
          )
        for (const workspace of workspaces) {
          try {
            await this.workspaceService.forceDeleteWorkspace(workspace.id)
          } catch (err) {
            console.warn('Error deleting workspace', err)
          }
        }

        for (const user of defaultUsers) {
          try {
            await this.accountService.forceRemoveUserFromAccount(
              user.id,
              defaultAccount.id
            )            
          } catch (err) {
            console.warn('Error removing user from account', err)
          }

          try {
            await this.userService.deleteUser(user.id)
          } catch (err) {
            console.warn('Error deleting user', err)
          }
        }

        await this.accountService.deleteAccountByName(defaultAccount.name)
      } else {
        this.logger.warn('Cleanup: Default account not found')
      }
    } catch (error) {
      console.error(error)
    }

    // remove razzle-account-manager app and razzle-workspace-manager apps from all workspaces (WorpaceApp)
    // delete razzle-account-manager app and razzle-workspace-manager apps (App)
    // find default account razzle-default-account and remove all users
    // delete default account razzle-default-account
    // find default user razzle-default-user and delete it
  }

  private async cleanupUsernames() {
    const defaultUser = await this.userService.getDefaultUser()
    const allUsers = await this.userService.getAllUsers()
    const usersWithOldUsername = allUsers.filter(
      (user) =>
        user.username === user.email && user.email !== defaultUser?.email
    )

    for (const user of usersWithOldUsername) {
      const username = user.email.split('@')[0]
      user.username = username
      try {
        await this.userService.upsertUser(user.authUid, user)
      } catch (err) {
        console.error(err)
      }
    }
  }

  private async cleanupAppHandles() {
    const allApps = await this.appsService.getAllApps()
    const appsWithoutHandles = allApps.filter(
      (app) => !app.handle || app.handle.trim() === ''
    )

    for (const app of appsWithoutHandles) {
      const handleName = app.name.toLowerCase().replace(/ /g, '-')
      const creatorAccountId = app.creatorId
      const acct = await this.accountService.getById(creatorAccountId)
      const handle = `${acct.owner.username}/${handleName}`

      try {
        await this.appsService.updateAppHandle(app.id, handle)
      } catch (err) {
        console.error(err)
      }
    }
  }

  private async bootstrapDefaultAccount() {
    const { userId } = await this.createDefaultUser()
    const { accountId } = await this.createDefaultAccount(userId)
    await this.createDefaultApps(accountId)
  }

  private async createDefaultUser(): Promise<{ userId: string }> {
    const user = await this.userService.getDefaultUser()
    let userId
    if (!user) {
      const res = await this.userService.createDefaultUser()
      userId = res.userId
      this.logger.log(`Created default user ${userId}`)
    } else {
      userId = user.id
      this.logger.log(`Default user ${userId} already exists`)
    }

    return { userId }
  }

  private async createDefaultAccount(
    userId: string
  ): Promise<{ accountId: string; accountName: string }> {
    const defaultAccounts = await this.accountService.getAccountsByOwner(userId)
    if (defaultAccounts.length > 0) {
      const { id: accountId, name: accountName } = defaultAccounts[0]
      this.logger.log(
        `Default account {accountId: ${accountId}, accountName: ${accountName}} already exists`
      )
      return { accountId, accountName }
    }

    const res = await this.accountService.createAccount(userId, {
      name: 'razzle-default-account',
      enableDomainMatching: false,
    })
    this.logger.log(
      `Created default account {accountId: ${res.id}, accountName: ${res.name}} `
    )
    return {
      accountId: res.id,
      accountName: res.name,
    }
  }

  private async createDefaultApps(accountId: string): Promise<void> {
    const defaultApps: DefaultAppData[] = this.defaultApps.getDefaultApps()
    for (const appData of defaultApps) {
      await this.createDefaultApp(accountId, appData)
    }
  }

  private async createDefaultApp(
    accountId: string,
    appData: DefaultAppData
  ): Promise<void> {
    const { appId: defaultAppId, apiKey, name, description, iconUrl } = appData
    const defaultApp = await this.appsService.getByAppId(defaultAppId)
    const user = await this.userService.getDefaultUser()

    if (!defaultApp) {
      const handleName = name.toLowerCase().replace(/ /g, '-')
      const handle = `${user.username}/${handleName}`
      const { appId: createdAppId, name: createdAppName } =
        await this.appsService.createApp(
          accountId,
          user,
          {
            accountId,
            description,
            iconUrl,
            name,
            isPublic: false,
            handle,
          },
          {
            appId: defaultAppId,
            apiKey,
            isDefault: true,
          }
        )

      this.logger.log(
        `Created default app: {name: ${createdAppName}, appId: ${createdAppId}`
      )
    } else {
      this.logger.log(
        `Default app: {name: ${defaultApp.name}, appId: ${defaultApp.appId} already exists`
      )
    }
  }
}
