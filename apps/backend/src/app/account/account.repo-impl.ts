import { Injectable } from '@nestjs/common'
import { Account, AccountUser, User } from '@prisma/client'
import { Page, PageParams } from '@razzle/dto'
import {
  AccountRepo,
  AccountWithOwner,
  AccountWithUser,
  App,
  CreateAccountData,
  appFromPrisma,
} from '@razzle/services'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AccountRepoImpl implements AccountRepo {
  constructor(private readonly prismaService: PrismaService) {}
  
  async getAllAccounts(): Promise<AccountWithOwner[]> {
    const res = await this.prismaService.account.findMany({
      include: {
        AccountUser: {
          select: {
            user: true,
            isOwner: true,
          },
        },
      },
    })

    return res.map((r) => {
      const owner = r.AccountUser.find((au) => au.isOwner).user
      return {
        ...r,
        owner,
      }
    })
  }

  async findById(id: string): Promise<AccountWithOwner | null> {
    const res = await this.prismaService.account.findUnique({
      where: {
        id,
      },
      include: {
        AccountUser: {
          select: {
            user: true,
            isOwner: true,
          },
        },
      },
    })

    const owner = res.AccountUser.find((au) => au.isOwner).user
    return {
      ...res,
      owner: owner,
    }
  }

  async createAccount(account: CreateAccountData): Promise<AccountWithOwner> {
    const res = await this.prismaService.account.create({
      data: {
        name: account.name,
        enableDomainMatching: account.enableDomainMatching,
        matchDomain: account.matchDomain,
        AccountUser: {
          create: {
            isOwner: true,
            user: {
              connect: {
                id: account.ownerId,
              },
            },
          },
        },
      },
      include: {
        AccountUser: {
          select: {
            user: true,
            isOwner: true,
          },
        },
      },
    })

    const owner = res.AccountUser.find((au) => au.isOwner).user
    return {
      ...res,
      owner,
    }
  }

  getUserAccounts(userId: string): Promise<Account[]> {
    return this.prismaService.account.findMany({
      where: {
        AccountUser: {
          some: {
            userId,
          },
        },
      },
    })
  }

  async getAccountsByOwnerId(userId: string): Promise<AccountWithOwner[]> {
    const res = await this.prismaService.account.findMany({
      where: {
        AccountUser: {
          some: {
            userId,
            isOwner: true,
          },
        },
      },
      include: {
        AccountUser: {
          select: {
            user: true,
            isOwner: true,
          },
        },
      },
    })
    return res.map((account) => {
      const owner = account.AccountUser.find((au) => au.isOwner).user
      return {
        ...account,
        owner,
      }
    })
  }

  async getAccountsByMemberId(userId: string): Promise<Account[]> {
    const res = await this.prismaService.account.findMany({
      where: {
        AccountUser: {
          some: {
            userId,
            isOwner: false,
          },
        },
      },
    })

    return res
  }

  async addUserToAccount(
    userId: string,
    accountId: string
  ): Promise<AccountUser> {
    return this.prismaService.accountUser.create({
      data: {
        userId,
        accountId,
      },
    })
  }

  async isUserInAccount(userId: string, accountId: string): Promise<boolean> {
    const accountUser = await this.prismaService.accountUser.findFirst({
      where: {
        accountId,
        userId,
      },
    })
    return !!accountUser
  }

  async getAllUsersInAccount(accountId: string): Promise<User[]> {
    const res = await this.prismaService.accountUser.findMany({
      where: {
        accountId,
      },
      select: {
        user: true,
      },
    })
    return res.map((au) => au.user)
  }

  async getUsersInAccount(
    accountId: string,
    pageParams: PageParams
  ): Promise<Page<AccountWithUser>> {
    const res = await this.prismaService.accountUser.findMany({
      where: {
        accountId,
        id: pageParams.cursor && { gt: pageParams.cursor },
      },
      include: {
        user: true,
        account: true,
      },
      take: pageParams.limit + 1,
    })

    const users = res.slice(0, pageParams.limit)
    const lastUser = res[res.length - 1]
    const hasNextPage = res.length > pageParams.limit
    const nextPageCursor = hasNextPage ? lastUser.id : null

    return {
      items: users,
      nextOffsetId: nextPageCursor,
    }
  }

  async removeUserFromAccount(
    userId: string,
    accountId: string
  ): Promise<boolean> {
    const res = await this.prismaService.accountUser.delete({
      where: {
        accountId_userId_isOwner: {
          accountId,
          userId,
          isOwner: false,
        },
      },
    })

    return !!res
  }

  async countUsersInAccount(accountId: string): Promise<number> {
    return this.prismaService.accountUser.count({
      where: {
        accountId,
      },
    })
  }

  async getAccountByMatchDomain(domain: string): Promise<Account | null> {
    const account = await this.prismaService.account.findFirst({
      where: {
        matchDomain: domain,
      },
    })
    return account
  }

  async findAccountUser(
    accountId: string,
    userId: string
  ): Promise<AccountUser> {
    return this.prismaService.accountUser.findFirst({
      where: {
        accountId,
        userId,
      },
    })
  }

  async findAccountUserWithOwner(accountId: string, userId: string): Promise<AccountWithOwner> {
    const res = await this.prismaService.accountUser.findFirst({
      where: {
        accountId,
        userId,
      },
      include: {
        account: true,
        user: true,
      },
    })
    return {
      ...res.account,
      owner: res.user,
    }
  }

  // TODO: DELETE THESE TWO METHODS
  async getByName(name: string): Promise<Account | null> {
    const res = await this.prismaService.account.findUnique({
      where: {
        name,
      },
      include: {
        AccountUser: {
          select: {
            user: true,
            isOwner: true,
          },
        },
      },
    })

    if (!res) {
      return null
    }
    return res
  }

  async deleteAccount(id: string): Promise<void> {
    await this.prismaService.account.delete({
      where: {
        id,
      },      
    })
  }

  async forceRemoveUserFromAccount(
    userId: string,
    accountId: string
  ): Promise<boolean> {
    const res = await this.prismaService.accountUser.delete({
      where: {
        accountId_userId_isOwner: {
          accountId,
          userId,
          isOwner: false,
        },
      },
    })

    await this.prismaService.accountUser.delete({
      where: {
        accountId_userId_isOwner: {
          accountId,
          userId,
          isOwner: true,
        },
      },
    })

    return !!res
  }
}
