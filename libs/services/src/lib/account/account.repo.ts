import { Account, AccountUser, User } from '@prisma/client'
import { Page, PageParams } from '@razzle/dto'
import { App } from '../apps'
import { AccountWithOwner, AccountWithUser, CreateAccountData } from './types'

export interface AccountRepo {
  getAllAccounts(): Promise<AccountWithOwner[]>
  findById(id: string): Promise<AccountWithOwner | null>
  createAccount(account: CreateAccountData): Promise<AccountWithOwner>
  getAccountsByOwnerId(userId: string): Promise<AccountWithOwner[]>
  getAccountsByMemberId(userId: string): Promise<Account[]>
  getAccountByMatchDomain(domain: string): Promise<Account | null>
  getUserAccounts(userId: string): Promise<Account[]>
  countUsersInAccount(accountId: string): Promise<number>
  addUserToAccount(userId: string, accountId: string): Promise<AccountUser>
  getAllUsersInAccount(accountId: string): Promise<User[]>
  getUsersInAccount(
    accountId: string,
    pageParams: PageParams
  ): Promise<Page<AccountWithUser>>
  findAccountUser(accountId: string, userId: string): Promise<AccountUser>
  isUserInAccount(userId: string, accountId: string): Promise<boolean>
  removeUserFromAccount(userId: string, accountId: string): Promise<boolean>  
}
