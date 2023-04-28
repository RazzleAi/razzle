import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { CallDetails, Razzle } from '@razzledotai/sdk'
import { AppsServiceImpl } from '../../apps/apps.service-impl'
import { BootstrapService } from '../../bootstrap/bootstrap.service'
import { UserServiceImpl } from '../../user/user.service.impl'
import { AccountServiceImpl } from '../../account/account.service-impl'
import { DefaultAppsServiceImpl } from '../default-apps.service-impl'
import { AccountManager } from './account-manager'

@Injectable()
export class AccountManagerService {
  private logger = new Logger(AccountManagerService.name)

  constructor(
    private readonly accountService: AccountServiceImpl,
    private readonly userService: UserServiceImpl,
    private readonly bootstrapService: BootstrapService,
    private readonly appsService: AppsServiceImpl,
    private readonly defaultApps: DefaultAppsServiceImpl
  ) {}

  private async sleep(): Promise<any> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({})
      }, 2000)
    })
  }

  getAccountManagerCredentials(): { appId: string; apiKey: string } {
    const appId = this.defaultApps.ACCOUNT_MANAGER_APP.appId
    const defaultAppApiKey = this.defaultApps.defaultAppApiKey(appId)

    return {
      appId,
      apiKey: defaultAppApiKey,
    }
  }

  initializeAccountManagerApp() {
    const { appId, apiKey } = this.getAccountManagerCredentials()
    Razzle.app({
      appId: appId,
      apiKey: apiKey,
      modules: [
        {
          module: AccountManager,
          deps: [this.accountService, this.userService, this.appsService],
        },
      ],
      requiresAuth: false,
      authenticate: (appId: string, callDetails: CallDetails): string => {
        return 'http://127.0.0.1:8084'
      },
    })
  }
}
