
import { Module } from '@nestjs/common'
import { AccountInviteEmailGeneratorImpl } from '../account/account-invite-email-generator'
import { PrismaModule } from '../prisma/prisma.module'
import { EmailDispatchGatewayImpl } from './email-dispatch-gateway-impl.service'
import { EmailDispatchTaskScheduler } from './email-task-scheduler'
import { EmailRepoImpl } from './email.repo-impl'
import { EmailServiceImpl } from './email.service-impl'


@Module({
  imports: [
    PrismaModule,
  ],
  providers: [
    EmailRepoImpl,
    EmailServiceImpl,
    EmailDispatchGatewayImpl,
    EmailDispatchTaskScheduler,
    {
      provide: "EMAIL_GENERATORS",
      useValue: [
        new AccountInviteEmailGeneratorImpl()
      ],
    }
  ],
  exports: [
    EmailServiceImpl, 
    EmailDispatchGatewayImpl, 
    EmailDispatchTaskScheduler, 
  ],
})
export class EmailModule {}

