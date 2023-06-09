import { AccountUser, AccountUserInviteToken } from './types'

export interface AccountUserInviteTokenGenerator {
  generateInviteToken(
    accountOwner: AccountUser,
    emailInvitee: string
  ): AccountUserInviteToken
}
