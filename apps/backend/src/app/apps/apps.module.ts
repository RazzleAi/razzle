import { Module } from '@nestjs/common'
import { MixpanelModule } from '../analytics/analytics.module'
import { EventModule } from '../event/event.module'
import { MlModule } from '../ml/ml.module'
import { PrismaModule } from '../prisma/prisma.module'
import { AppsController } from './apps.controller'
import { AppsRepoImpl } from './apps.repo.impl'
import { AppsServiceImpl } from './apps.service-impl'
import UserAppAuthenticationHandlerImpl from './user-app-authentication-message-handler'
import { UserAppAuthenticationRepoImpl } from './user-app-authentication.repo'

@Module({
  imports: [PrismaModule, MlModule, EventModule, MixpanelModule],
  controllers: [AppsController],
  providers: [
    AppsServiceImpl,
    AppsRepoImpl,
    UserAppAuthenticationRepoImpl,
    UserAppAuthenticationHandlerImpl,
  ],
  exports: [
    AppsServiceImpl,
    AppsRepoImpl,
    UserAppAuthenticationRepoImpl,
    UserAppAuthenticationHandlerImpl,
  ],
})
export class AppsModule {}
