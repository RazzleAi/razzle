import {
  AccountUser as PrismaAccountUser,
  Account as PrismaAccount,
} from '@prisma/client'
import { User } from '../user'

export type Account = PrismaAccount
export type AccountUser = PrismaAccountUser

export interface CreateAccountData {
  name: string
  ownerId: string
  enableDomainMatching?: boolean
  matchDomain?: string
}

export type AccountWithOwner = Account & { owner: User }
export type AccountWithUser = AccountUser & { account: Account; user: User }
