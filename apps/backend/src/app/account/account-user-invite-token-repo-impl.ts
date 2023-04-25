import { Injectable } from '@nestjs/common'
import { AccountUserInviteToken } from '@prisma/client'
import { AccountUserInviteTokenRepo } from '@razzle/services'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AccountUserInviteTokenRepoImpl
  implements AccountUserInviteTokenRepo
{
  private prisma: PrismaService['accountUserInviteToken']

  constructor(private readonly prismaService: PrismaService) {
    this.prisma = this.prismaService.accountUserInviteToken
  }

  findByToken(token: string): Promise<AccountUserInviteToken | null> {
    return this.prismaService.accountUserInviteToken.findFirst({
      where: { token },
    })
  }

  findByUserIdAndAccountId(
    userId: string,
    accountId: string
  ): Promise<AccountUserInviteToken> {
    return this.prismaService.accountUserInviteToken.findFirst({
      where: {
        userId,
        accountId,
      }, 
    })
  }

  findByUserIdAndAccountIdAndValid(
    userId: string,
    accountId: string
  ): Promise<AccountUserInviteToken> {
    return this.prismaService.accountUserInviteToken.findFirst({
      where: {
        userId,
        accountId,
        expiresOn: {
          gt: new Date(),
        },
      },
    })
  }

  createToken(token: AccountUserInviteToken): Promise<AccountUserInviteToken> {
    return this.prismaService.accountUserInviteToken.create({
      data: token,
    })
  }

  invalidateToken(token: string): Promise<AccountUserInviteToken> {
    return this.prismaService.accountUserInviteToken.update({
      where: { token },
      data: { valid: false },
    })
  }

  async invalidateExpiredTokens(): Promise<void> {
    const date = new Date().toISOString()
    console.log('Comparing Date: ' + date)
    await this.prisma.updateMany({
      where: {
        expiresOn: {
          lt: new Date(),
        },
      },
      data: {
        valid: false,
      },
    })
  }

  findValidTokenByAccountIdAndEmail(
    accountId: string,
    email: string
  ): Promise<AccountUserInviteToken> {
    return this.prismaService.accountUserInviteToken.findFirst({
      where: {
        accountId,
        emailInvitee: email,
        valid: true,
        expiresOn: {
          gt: new Date(),
        },
      },
    })
  }
}
