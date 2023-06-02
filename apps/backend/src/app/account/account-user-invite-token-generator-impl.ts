import { Injectable } from '@nestjs/common'
import { AccountUser, AccountUserInviteToken } from '@prisma/client'
import { AccountUserInviteTokenGenerator } from '@razzle/domain'
import { v4 as uuidv4 } from 'uuid'

@Injectable()
export class AccountUserInviteTokenGeneratorImpl
  implements AccountUserInviteTokenGenerator
{
  generateInviteToken(
    accountOwner: AccountUser,
    emailInvitee: string
  ): AccountUserInviteToken {
    if (!accountOwner.isOwner) {
      throw new Error('Only account owners can invite users')
    }

    console.log(
      `Token Expiry Value: ${process.env.ACCOUNT_INVITE_TOKEN_EXPIRY_MS}`
    )

    return {
      accountId: accountOwner.accountId,
      userId: accountOwner.userId,
      token: `${uuidv4()}-${new Date().getTime()}-${uuidv4()}`,
      emailInvitee,
      expiresOn: new Date(
        new Date().getTime() +
          Number(process.env.ACCOUNT_INVITE_TOKEN_EXPIRY_MS)
      ),
      valid: true,
    } as unknown as AccountUserInviteToken
  }
}
