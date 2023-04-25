import { Module } from '@nestjs/common'
import { AccountModule } from '../account/account.module'
import { AppsModule } from '../apps/apps.module'
import { BootstrapModule } from '../bootstrap/bootstrap.module'
import { UserModule } from '../user/user.module'
import { WorkspaceModule } from '../workspace/workspace.module'
import { AccountManagerService } from './account-manager'
import { DefaultAppsHelperModule } from './default-apps-helpers.module'

@Module({
  imports: [WorkspaceModule, AccountModule, UserModule, AppsModule, BootstrapModule, DefaultAppsHelperModule],
  providers: [AccountManagerService],
  exports: []
})
export class DefaultAppsModule {}
