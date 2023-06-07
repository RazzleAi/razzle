import { Module } from '@nestjs/common'
import { UserModule } from '../user/user.module'
import { AuthRepoImpl } from './auth.repo'
import { AuthServiceImpl } from './auth.service.impl'
import { PrismaModule } from '../prisma/prisma.module'
import { AuthController } from './auth.controller'
import { UserAppAuthenticationRepoImpl } from '../apps/user-app-authentication.repo'
import { AccountModule } from '../account/account.module'

@Module({
  imports: [PrismaModule, UserModule, AccountModule],
  providers: [AuthServiceImpl, AuthRepoImpl, UserAppAuthenticationRepoImpl],
  exports: [AuthServiceImpl, AuthRepoImpl, UserAppAuthenticationRepoImpl],
  controllers: [AuthController],
})
export class AuthModule {}
