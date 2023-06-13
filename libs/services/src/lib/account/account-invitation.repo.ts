import {
  AccountInvitation,
  AccountInvitationFilter,
  CreateAccountInvitationInput,
  UpdateAccountInvitationInput,
} from './types'

export interface AccountInvitationRepo {
  createAccountInvitation(
    input: CreateAccountInvitationInput
  ): Promise<AccountInvitation>
  updateAccountInvitation(
    id: string,
    input: UpdateAccountInvitationInput
  ): Promise<AccountInvitation>
  deleteAccountInvitation(id: string): Promise<AccountInvitation>
  findAccountInvitation(
    filter: AccountInvitationFilter
  ): Promise<AccountInvitation[]>
}
