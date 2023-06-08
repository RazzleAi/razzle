import { Module } from '@nestjs/common'
import { MlModule } from '../ml/ml.module'
import { PrismaModule } from '../prisma/prisma.module'
import { AppsController } from './apps.controller'
import { AppsRepoImpl } from './apps.repo.impl'
import { AppsServiceImpl } from './apps.service-impl'
import UserAppAuthenticationHandlerImpl from './user-app-authentication-message-handler'
import { UserAppAuthenticationRepoImpl } from './user-app-authentication.repo'
import { ToolsModule } from '../tools/tools.module'

@Module({
  imports: [PrismaModule, MlModule, ToolsModule],
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
