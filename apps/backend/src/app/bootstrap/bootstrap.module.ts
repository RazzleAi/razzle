import { Module } from '@nestjs/common'
import { AccountModule } from '../account/account.module'
import { AppsModule } from '../apps/apps.module'
import { BootstrapService } from './bootstrap.service'
import { AuthModule } from '../auth/auth.module'
import { UserModule } from '../user/user.module'

@Module({
  imports: [
    AccountModule,
    AppsModule,
    AuthModule,
    UserModule,
  ],
  providers: [BootstrapService],
  exports: [BootstrapService],
})
export class BootstrapModule {}
