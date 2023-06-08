import {
  AccountUser as PrismaAccountUser,
  Account as PrismaAccount,
  AccountApp as PrismaAccountApp,
} from '@prisma/client'
import { User } from '../user'

export type AccountApp = PrismaAccountApp
export type Account = Omit<PrismaAccount, 'accountApps'> & {
  accountApps: AccountApp[]
}
export type AccountUser = PrismaAccountUser

export interface CreateAccountData {
  name: string
  ownerId: string
  enableDomainMatching?: boolean
  matchDomain?: string
}

export type AccountWithOwner = Account & { owner: User }
export type AccountWithUser = AccountUser & { account: Account; user: User }
