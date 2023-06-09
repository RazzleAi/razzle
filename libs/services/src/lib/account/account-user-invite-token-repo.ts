import { AccountUserInviteToken } from './types'

export interface AccountUserInviteTokenRepo {
  findByToken(token: string): Promise<AccountUserInviteToken | null>
  findByUserIdAndAccountId(
    userId: string,
    accountId: string
  ): Promise<AccountUserInviteToken | null>
  findByUserIdAndAccountIdAndValid(
    userId: string,
    accountId: string
  ): Promise<AccountUserInviteToken | null>
  findByUserIdAndAccountIdAndValid(
    userId: string,
    accountId: string
  ): Promise<AccountUserInviteToken | null>
  findValidTokenByAccountIdAndEmail(
    accountId: string,
    email: string
  ): Promise<AccountUserInviteToken | null>
  createToken(token: AccountUserInviteToken): Promise<AccountUserInviteToken>
  invalidateToken(token: string): Promise<AccountUserInviteToken>
  invalidateExpiredTokens(): void
}
