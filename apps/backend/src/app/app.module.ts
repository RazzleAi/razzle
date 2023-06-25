import { MiddlewareConsumer, Module } from '@nestjs/common'
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
import { ConstantsModule } from './constants.module'
import { ScheduleModule } from '@nestjs/schedule'
import { EventEmitterModule } from '@nestjs/event-emitter'
import { CoreModule } from './core/core.module'
import { ToolsModule } from './tools/tools.module'
import { RequestLogger } from './request-logger.middleware'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),
    ScheduleModule.forRoot(),
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
    }),    
    ToolsModule,
    ConstantsModule,
    PrismaModule,
    AuthModule,
    UserModule,
    AppsModule,
    CoreModule,
    MlModule,
    AccountModule,
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
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    if (process.env.NODE_ENV.toLowerCase() === 'production') {
      return
    }

    if (process.env.LOG_REQUESTS === 'true') {
      consumer.apply(RequestLogger).forRoutes('*')
    }
  }
}
