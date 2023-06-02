import { Injectable } from '@nestjs/common'
import { AccountUserInviteEmail } from '@prisma/client'
import { AccountUserInviteEmailRepo } from '@razzle/domain'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AccountUserInviteEmailRepoImpl
  implements AccountUserInviteEmailRepo
{
  constructor(private readonly prismaService: PrismaService) {}

  public findByEmailReference(
    emailRef: string
  ): Promise<AccountUserInviteEmail> {
    return this.prismaService.accountUserInviteEmail.findFirst({
      where: {
        emailReference: emailRef,
      },
    })
  }

  public create(
    email: AccountUserInviteEmail
  ): Promise<AccountUserInviteEmail> {
    return this.prismaService.accountUserInviteEmail.create({
      data: email,
    })
  }
}
