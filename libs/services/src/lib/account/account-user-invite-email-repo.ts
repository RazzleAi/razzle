import { AccountUserInviteEmail } from './types'

export interface AccountUserInviteEmailRepo {
  findByEmailReference(email: string): Promise<AccountUserInviteEmail | null>

  create(email: AccountUserInviteEmail): Promise<AccountUserInviteEmail>
}
