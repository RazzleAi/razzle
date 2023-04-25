import { Module } from '@nestjs/common'
import { AppsModule } from '../apps/apps.module'
import { MlModule } from '../ml/ml.module'
import { PrismaModule } from '../prisma/prisma.module'
import { WorkspaceModule } from '../workspace/workspace.module'
import { UserController } from './user.controller'
import { UserRepoImpl } from './user.repo.impl'
import { UserServiceImpl } from './user.service.impl'

@Module({
  imports: [PrismaModule, AppsModule, MlModule, WorkspaceModule],
  providers: [UserServiceImpl, UserRepoImpl],
  exports: [UserServiceImpl, UserRepoImpl],
  controllers: [UserController],
})
export class UserModule {}
