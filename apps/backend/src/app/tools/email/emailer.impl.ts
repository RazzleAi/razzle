import { Logger } from '@nestjs/common'
import { Emailer } from '@razzle/services'
import { ServerClient } from 'postmark'

export class EmailerImpl implements Emailer {
  private readonly logger = new Logger(EmailerImpl.name)
  private postmarkClient: ServerClient
  constructor() {
    this.postmarkClient = new ServerClient(process.env.POSTMARK_API_KEY)
  }

  async sendEmail(
    recipient: string,
    subject: string,
    message: string
  ): Promise<boolean> {
    const resp = await this.postmarkClient.sendEmail({
      From: 'no-reply@razzle.ai',
      To: recipient,
      Subject: subject,
      HtmlBody: message,
      MessageStream: 'outbound',
    })
    if (resp.ErrorCode) {
      this.logger.error(`Error sending email to ${recipient}: ${resp.Message}`)
      return false
    }

    return true
  }
}
