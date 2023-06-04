/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

import { Logger } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { WsAdapter } from '@nestjs/platform-ws'

import { AppModule } from './app/app.module'
import * as admin from 'firebase-admin'
import * as Rollbar from 'rollbar'
import { environment } from './environments/environment'

async function bootstrap() {
  const rollbar = new Rollbar({
    accessToken: process.env.ROLLBAR_ACCESS_TOKEN,
    captureUncaught: true,
    captureUnhandledRejections: true,
    environment: process.env.NODE_ENV || 'development',
    nodeSourceMaps: true,
    exitOnUncaughtException: false,
  })

  admin.initializeApp({
    credential: admin.credential.cert({
      ...environment.firebaseConfig,
    }),
  })

  const app = await NestFactory.create(AppModule)
  const globalPrefix = ''
  app.setGlobalPrefix(globalPrefix)
  app.useWebSocketAdapter(new WsAdapter(app))
  app.enableCors()

  const port = process.env.PORT || 3333
  await app.listen(port)
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  )
}

bootstrap()
