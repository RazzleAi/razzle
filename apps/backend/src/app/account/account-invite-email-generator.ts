import { Injectable } from '@nestjs/common'
import { ContentType, Email, EmailType } from '@prisma/client'
import { EmailGenerator } from '@razzle/domain'

@Injectable()
export class AccountInviteEmailGeneratorImpl implements EmailGenerator {
  public static TYPE = 'account-invite'

  public async generateEmail(map: Map<string, unknown>): Promise<Email> {
    const token = map.get('token') as string
    return {
      reference: map.get('reference'),
      to: map.get('to'),
      subject: 'Razzle Account Invite',
      body: `You have been invited to join an account on Razzle. Click this <a href="${process.env.FRONT_END_BASE_URL}/account/invite?token=${token}">link</a>`,
      sent: false,
      emailType: EmailType.ACCOUNT_USER_INVITE,
      contentType: ContentType.TEXT,
    } as Email
  }

  public type(): string {
    return AccountInviteEmailGeneratorImpl.TYPE
  }
}
