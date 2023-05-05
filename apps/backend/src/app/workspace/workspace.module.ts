import { Module } from '@nestjs/common'
import { AppsModule } from '../apps/apps.module'
import { EventModule } from '../event/event.module'
import { MlModule } from '../ml/ml.module'
import { PrismaModule } from '../prisma/prisma.module'
import { WorkspaceController } from './workspace.controller'
import { WorkspaceRepoImpl } from './workspace.repo-impl'
import { WorkspaceServiceImpl } from './workspace.service-impl'

@Module({
  imports: [PrismaModule, MlModule, AppsModule, EventModule],
  providers: [WorkspaceServiceImpl, WorkspaceRepoImpl],
  exports: [WorkspaceServiceImpl],
  controllers: [WorkspaceController],
})
export class WorkspaceModule {}
