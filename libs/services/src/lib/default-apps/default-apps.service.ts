import { App } from '@prisma/client'
import { Md5 } from 'ts-md5'

export type DefaultAppData = Partial<App>

export class DefaultAppsService {

  defaultAppApiKey(appId: string) {
    const defaultAppKeySecret = process.env.DEFAULT_APP_KEY_SECRET || ''
    // TODO: improve this key generation
    const defaultAppApiKey = new Md5()
      .appendStr(defaultAppKeySecret)
      .appendStr(appId)
      .end() as string
    return defaultAppApiKey
  }


  ACCOUNT_MANAGER_APP: DefaultAppData = {
    appId: 'razzle-account-manager',
    name: 'Razzle Account Manager',
    description: 'Razzle Account manager app',
    apiKey: this.defaultAppApiKey('razzle-account-manager'),
  }


  WORKSPACE_MANAGER_APP: DefaultAppData = {
    appId: 'razzle-workspace-manager',
    name: 'Razzle Workspace Manager',
    description: 'Razzle workspace manager app',
    apiKey: this.defaultAppApiKey('razzle-workspace-manager'),
  }


  getDefaultApps(): DefaultAppData[] {
    return [this.ACCOUNT_MANAGER_APP]
  }

}

