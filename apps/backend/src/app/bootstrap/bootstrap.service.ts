import { Injectable, Logger } from '@nestjs/common'
import { AccountServiceImpl } from '../account/account.service-impl'
import { AppsServiceImpl } from '../apps/apps.service-impl'

@Injectable()
export class BootstrapService {
  private logger = new Logger(BootstrapService.name)

  constructor(
    private readonly accountService: AccountServiceImpl,
    private readonly appsService: AppsServiceImpl,
  ) {}

  onModuleInit() {
    if (process.env.NODE_ENV === 'test') {
      return
    }

    this.cleanupAppHandles()
  }

  // TODO: DELETE AFTER CLEANUP IN PROD
  /**
   * This function is used to clean up old usernames which were just a copy of emails. new usernames areextracted from the users emails
   */

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
}
