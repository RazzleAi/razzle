import { Account } from '@prisma/client'
import { App } from '../../apps'

export const ACCOUNT_CREATED_EVENT = 'account.created'
export const APP_CREATED_EVENT = 'app.created'
export const FIRST_APP_CREATED_EVENT = 'app.created.first'
export const FIRST_APP_SYNCED_EVENT = 'app.synced.first'

export type AccountCreatedEventPayload = Account & { userId: string }
export type AppCreatedEventPayload = App & { accountId: string }
export type AppSyncedEventPayload = App & { accountId: string }
