import {
  AccountUser as PrismaAccountUser,
  Account as PrismaAccount,
  AccountApp as PrismaAccountApp,
  AccountInvitation as PrismaAccountInvitation,
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

export type AccountInvitation = PrismaAccountInvitation & {invitedBy: User, account: Account}

export interface CreateAccountInvitationInput {
  inviteeEmail: string
  invitedByUserId: string
  accountId: string
  expiryDate: Date
  token: string
}

export type UpdateAccountInvitationInput = Pick<
  AccountInvitation,
  'token' | 'expiryDate'
>

export type AccountInvitationFilter = Partial<
  Pick<
    AccountInvitation,
    'accountId' | 'inviteeEmail' | 'invitedById' | 'token'
  >
>
