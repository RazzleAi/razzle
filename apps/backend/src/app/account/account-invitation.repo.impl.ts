import {
  AccountInvitationFilter,
  AccountInvitationRepo,
  CreateAccountInvitationInput,
  UpdateAccountInvitationInput,
  AccountInvitation,
} from '@razzle/services'
import { PrismaService } from '../prisma/prisma.service'
import { Injectable } from '@nestjs/common'

@Injectable()
export class AccountInvitationRepoImpl implements AccountInvitationRepo {
  private prisma: PrismaService['accountInvitation']

  constructor(prismaService: PrismaService) {
    this.prisma = prismaService.accountInvitation
  }

  createAccountInvitation(
    input: CreateAccountInvitationInput
  ): Promise<AccountInvitation> {
    return this.prisma.create({
      data: {
        inviteeEmail: input.inviteeEmail,
        invitedById: input.invitedByUserId,
        expiryDate: input.expiryDate,
        accountId: input.accountId,
        createdAt: new Date(),
        token: input.token,
      },
      include: {
        account: true,
        invitedBy: true,
      },
    })
  }

  updateAccountInvitation(
    id: string,
    input: UpdateAccountInvitationInput
  ): Promise<AccountInvitation> {
    return this.prisma.update({
      where: {
        id,
      },
      data: input,
      include: {
        account: true,
        invitedBy: true,
      },
    })
  }

  deleteAccountInvitation(id: string): Promise<AccountInvitation> {
    return this.prisma.delete({
      where: {
        id,
      },
      include: {
        account: true,
        invitedBy: true,
      },
    })
  }

  findAccountInvitation(
    filter: AccountInvitationFilter
  ): Promise<AccountInvitation[]> {
    return this.prisma.findMany({
      where: {
        AND: [filter],
      },
      include: {
        account: true,
        invitedBy: true,
      },
    })
  }
}
