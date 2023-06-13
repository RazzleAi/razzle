import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { AppsModule } from '../app/apps/apps.module'
import { PrismaModule } from '../app/prisma/prisma.module'
import { UserModule } from '../app/user/user.module'
import { AuthModule } from '../app/auth/auth.module'
import { ConfigModule } from '@nestjs/config'
import { MlModule } from '../app/ml/ml.module'
import { AccountModule } from '../app/account/account.module'
import configuration from '../app/config/configuration'
import * as admin from 'firebase-admin'
import { WsAdapter } from '@nestjs/platform-ws'

export async function initNestApp(): Promise<INestApplication> {
  admin.initializeApp()

  const module = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({ isGlobal: true, load: [configuration] }),      
      PrismaModule,
      AuthModule,
      UserModule,
      AppsModule,
      MlModule,
      AccountModule,
    ],
  }).compile()

  const app = module.createNestApplication()
  app.useWebSocketAdapter(new WsAdapter(app))
  await app.init()
  return app
}
