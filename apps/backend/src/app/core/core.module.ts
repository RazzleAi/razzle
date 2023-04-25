import { Module } from '@nestjs/common'
import { KafkaModule } from '../kafka/kafka.module'
import { RedisModule } from '../redis/redis.module'
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
import {ConnectedAgentsImpl} from './agent/connected-agents.impl'
import {ConnectedClientsImpl} from './client/connected-clients.impl'
import {
  ClientGateway,
  ClientHistoryRepoImpl,
  ClientHistoryStoreImpl,
  ClientRequestValidatorImpl,
} from './client'
import { EventModule } from '../event/event.module'
import { MixpanelModule } from '../analytics/analytics.module'
import { AgentToEngineMessengerImpl } from './messaging/agent-to-engine.impl'
import { ClientToEngineMessengerImpl } from './messaging/client-to-engine.impl'
import { AgentCallerImpl, RazzleEngineImpl } from './engine'

@Module({
  imports: [
    KafkaModule,
    RedisModule,
    PrismaModule,
    UserModule,
    AccountModule,
    AuthModule,
    MlModule,
    AppsModule,
    EventModule,
    MixpanelModule,
  ],  
  providers: [
    ConnectedClientsImpl,
    ConnectedAgentsImpl,
    ClientGateway,
    AgentGateway,
    AgentSyncServiceImpl,
    AgentHeaderValidatorImpl,
    ClientHistoryRepoImpl,
    ClientRequestValidatorImpl,
    AgentToEngineMessengerImpl,
    ClientToEngineMessengerImpl,
    ClientHistoryRepoImpl,
    ClientHistoryStoreImpl,
    AgentCallerImpl,
    RazzleEngineImpl,    
  ],
  exports: [],
})
export class CoreModule {}
