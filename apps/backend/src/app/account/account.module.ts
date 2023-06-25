import { Module } from '@nestjs/common'
import { AppsModule } from '../apps/apps.module'
import { OnboardingModule } from '../onboarding/onboarding.module'
import { PrismaModule } from '../prisma/prisma.module'
import { UserModule } from '../user/user.module'
import { AccountController } from './account.controller'
import { AccountRepoImpl } from './account.repo-impl'
import { AccountServiceImpl } from './account.service-impl'
import { ToolsModule } from '../tools/tools.module'
import { AccountInvitationRepoImpl } from './account-invitation.repo.impl'

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AppsModule,
    OnboardingModule,
    ToolsModule,
  ],
  providers: [
    AccountServiceImpl,
    AccountRepoImpl,
    AccountInvitationRepoImpl,
  ],
  controllers: [AccountController],
  exports: [
    AccountRepoImpl,
    AccountServiceImpl,
    AccountInvitationRepoImpl,
  ],
})
export class AccountModule {}
