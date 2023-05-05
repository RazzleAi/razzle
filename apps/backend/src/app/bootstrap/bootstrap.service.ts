import { Injectable, Logger } from '@nestjs/common'
import { AccountServiceImpl } from '../account/account.service-impl'
import { AppsServiceImpl } from '../apps/apps.service-impl'
import { UserRepoImpl } from '../user/user.repo.impl'
import { AppsRepoImpl } from '../apps/apps.repo.impl'

@Injectable()
export class BootstrapService {
  private logger = new Logger(BootstrapService.name)

  constructor(
    private readonly accountService: AccountServiceImpl,
    private readonly usersRepo: UserRepoImpl,
    private readonly appsService: AppsServiceImpl,
    private readonly appsRepo: AppsRepoImpl,
  ) {}

  onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      return
    }

    this.cleanupUsernames()
  }

  // TODO: DELETE AFTER CLEANUP IN PROD
  /**
   * This function is used to clean up old usernames which were just a copy of emails. new usernames areextracted from the users emails
   */

  private async cleanupUsernames() {
    const allUsers = await this.usersRepo.getAllUsers()
    const usersToUpdate = allUsers.filter(
      (user) => user.username === user.email
    )
    for (const user of usersToUpdate) {
      const parts = user.email.split('@')
      if (parts.length < 1) {
        continue
      }
      let username = parts[0]
      const existingWithUsername = await this.usersRepo.findByUsername(
        username
      )
      if (existingWithUsername && existingWithUsername.id !== user.id) {
        // generate a random username
        username = `${username}-${Math.floor(Math.random() * 100000)}`
      }

      try {
        await this.usersRepo.upsertUser(user.authUid, {...user, username})
      } catch (err) {
        console.error(err)
      }
    }

    await this.cleanupAppHandles()

    const accountManager = await this.appsRepo.findByAppId({appId: 'razzle-account-manager'})
    if (!accountManager) {
      return
    }

    const accountManagerId = accountManager.id    
    await this.appsRepo.deleteWorkspaceAppsForAppByID(accountManagerId)
  }

  private async cleanupAppHandles() {
    const allApps = await this.appsService.getAllApps()
    for (const app of allApps) {
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

  
}
