import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { AccountModule } from '../account/account.module'
import { MlModule } from '../ml/ml.module'
import { AppsModule } from '../apps/apps.module'
import { AuthModule } from '../auth/auth.module'
import { PrismaModule } from '../prisma/prisma.module'
import {
  AgentGateway,
  AgentHeaderValidatorImpl,
  AgentSyncServiceImpl,
} from './agent'
import { ConnectedAgentsImpl } from './agent/connected-agents.impl'
import { ConnectedClientsImpl } from './client/connected-clients.impl'
import { ClientGateway, ClientRequestValidatorImpl } from './client'
import { AgentToEngineMessengerImpl } from './messaging/agent-to-engine.impl'
import { ClientToEngineMessengerImpl } from './messaging/client-to-engine.impl'
import { AgentCallerImpl, RazzleEngineImpl } from './engine'
import { ChatServiceImpl } from './chat/chat-service.impl'
import { ChatRepoImpl } from './chat/chat-repo.impl'
import { ToolsModule } from '../tools/tools.module'

@Module({
  imports: [
    PrismaModule,
    UserModule,
    AccountModule,
    AuthModule,
    MlModule,
    AppsModule,
    ToolsModule,
  ],
  providers: [
    ConnectedClientsImpl,
    ConnectedAgentsImpl,
    ClientGateway,
    AgentGateway,
    AgentSyncServiceImpl,
    AgentHeaderValidatorImpl,
    ClientRequestValidatorImpl,
    AgentToEngineMessengerImpl,
    ClientToEngineMessengerImpl,
    AgentCallerImpl,
    RazzleEngineImpl,
    ChatServiceImpl,
    ChatRepoImpl,
  ],
  exports: [],
})
export class CoreModule {}
