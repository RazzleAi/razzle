import { Module } from '@nestjs/common'
import { AppsModule } from '../apps/apps.module'
import { EmailModule } from '../email/email.module'
import { EventModule } from '../event/event.module'
import { OnboardingModule } from '../onboarding/onboarding.module'
import { PrismaModule } from '../prisma/prisma.module'
import { UserModule } from '../user/user.module'
import { AccountUserInviteEmailRepoImpl } from './account-user-invite-email-repo-impl'
import { AccountUserInviteExpiryTaskScheduler } from './account-user-invite-expiry-task-scheduler'
import { AccountUserInviteTokenGeneratorImpl } from './account-user-invite-token-generator-impl'
import { AccountUserInviteTokenRepoImpl } from './account-user-invite-token-repo-impl'
import { AccountController } from './account.controller'
import { AccountRepoImpl } from './account.repo-impl'
import { AccountServiceImpl } from './account.service-impl'

@Module({
  imports: [
    PrismaModule,
    EmailModule,
    UserModule,
    AppsModule,
    OnboardingModule,
    EventModule,
  ],
  providers: [
    AccountServiceImpl,
    AccountRepoImpl,
    AccountUserInviteTokenRepoImpl,
    AccountUserInviteEmailRepoImpl,
    AccountUserInviteTokenGeneratorImpl,
    AccountUserInviteExpiryTaskScheduler,
  ],
  controllers: [AccountController],
  exports: [
    AccountRepoImpl,
    AccountServiceImpl,
    AccountUserInviteTokenRepoImpl,
    AccountUserInviteExpiryTaskScheduler,
  ],
})
export class AccountModule {}
