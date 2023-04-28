import { Injectable, Logger } from '@nestjs/common'
import { DefaultAppData } from '@razzle/services'
import { AccountServiceImpl } from '../account/account.service-impl'
import { AppsServiceImpl } from '../apps/apps.service-impl'
import { DefaultAppsServiceImpl } from '../default-apps/default-apps.service-impl'
import { UserServiceImpl } from '../user/user.service.impl'
import { AuthServiceImpl } from '../auth/auth.service-impl'

@Injectable()
export class BootstrapService {
  private logger = new Logger(BootstrapService.name)
  private _isBootstrapped = false

  constructor(
    private readonly userService: UserServiceImpl,
    private readonly accountService: AccountServiceImpl,
    private readonly appsService: AppsServiceImpl,
    private readonly authService: AuthServiceImpl,
    private readonly defaultApps: DefaultAppsServiceImpl
  ) {}

  onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      return
    }
    // setTimeout(async () => {
    //   await this.bootstrapDefaultAccount()
    //   await this.cleanupUsernames()
    //   this.cleanupAppHandles()
    // }, 58000)
  }

  get isBootstrapped() {
    return this._isBootstrapped
  }

  set isBootstrapped(val: boolean) {
    this._isBootstrapped = val
  }

  // TODO: DELETE AFTER CLEANUP IN PROD
  /**
   * This function is used to clean up old usernames which were just a copy of emails. new usernames areextracted from the users emails
   */
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
    const appsWithoutHandles = allApps.filter((app) => !app.handle || app.handle.trim() === '')

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
    this.isBootstrapped = true
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
