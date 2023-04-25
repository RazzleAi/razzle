import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core'
import { AuthModule } from './auth/auth.module'
import { AuthGuard } from './auth/guards'
import { ResponseTransformerInterceptor } from './interceptors'
import { PrismaModule } from './prisma/prisma.module'
import { AppsModule } from './apps/apps.module'
import { UserModule } from './user/user.module'
import configuration from './config/configuration'
import { MlModule } from './ml/ml.module'
import { AccountModule } from './account/account.module'
import { WorkspaceModule } from './workspace/workspace.module'
import { DefaultAppsModule } from './default-apps/default-apps.module'
import { BootstrapModule } from './bootstrap/bootstrap.module'
import { DefaultAppsHelperModule } from './default-apps/default-apps-helpers.module'
import { ConstantsModule } from './constants.module'
import { ScheduleModule } from '@nestjs/schedule'
import { KafkaModule } from './kafka/kafka.module'
import { RedisModule } from './redis/redis.module'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { EventModule } from './event/event.module'
import { CoreModule } from './core/core.module'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),
    EventModule,
    ConstantsModule,
    KafkaModule,
    RedisModule,
    PrismaModule,
    AuthModule,
    BootstrapModule,
    UserModule,
    AppsModule,
    WorkspaceModule,
    CoreModule,
    MlModule,
    AccountModule,
    DefaultAppsModule,
    DefaultAppsHelperModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseTransformerInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
  controllers: [],
})
export class AppModule {}
