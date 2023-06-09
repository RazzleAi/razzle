
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import sgMail = require("@sendgrid/mail");
import { EmailServiceImpl } from './email.service-impl';
import { Email } from '@razzle/services';


@Injectable()
export class EmailDispatchTaskScheduler {

  private readonly logger = new Logger(EmailDispatchTaskScheduler.name);

  constructor(
    private readonly emailServiceImpl: EmailServiceImpl,
  ) {}


  @Cron(process.env.EMAIL_CRON)
  handleCron() {
    this.logger.debug('Commencing Email Dispatch Cron..');

    this.dispatchEmails();
  }
  

  async dispatchEmails() {
    let page = 1;
    const pageSize = 20;

    let emailsPage;

    while ((emailsPage = await this.emailServiceImpl.fetchEmailsPaginated(page, pageSize)).length > 0) {
      this.logger.debug(`Processing page ${page} of emails..`);
      const sentMails = []

      for (const email of emailsPage) {
        if (await this.processEmail(email)) {
          sentMails.push(email);
        }
      }

      if (sentMails.length > 0) {
        await this.emailServiceImpl.updateEmails(sentMails);
      }

      page++;
    }
  }


  async processEmail(email: Email): Promise<boolean> {
    this.logger.debug(`Processing email ${email.id}..`);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
    let sent = false;
    await sgMail.send(
      {
        to: email.to,
        from: email.from || process.env.DEFAULT_EMAIL_SENDER,
        subject: email.subject,
        html: email.body,
      }
    )
    .then(() => {
      this.logger.debug(`Email ${email.id} dispatched successfully`);
      sent = true;
    })
    .catch((error) => {
      this.logger.error(`Email ${email.id} dispatch failed with error: ${error}`);
      sent = false;
    });

    return sent;
  }


}


