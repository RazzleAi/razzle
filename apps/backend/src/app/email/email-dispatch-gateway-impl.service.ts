import { Inject, Injectable } from '@nestjs/common'
import { Email } from '@prisma/client'
import { EmailDispatchGateway, EmailGenerator } from '@razzle/services'
import { EmailDispatchTaskScheduler } from './email-task-scheduler'

import { EmailServiceImpl } from './email.service-impl'

@Injectable()
export class EmailDispatchGatewayImpl implements EmailDispatchGateway {
  private emailGeneratorMap: Map<string, EmailGenerator> = new Map()

  constructor(
    private readonly emailService: EmailServiceImpl,
    private readonly emailDispatchScheduler: EmailDispatchTaskScheduler,
    @Inject('EMAIL_GENERATORS')
    private readonly emailGenerators: EmailGenerator[]
  ) {
    for (const emailGenerator of emailGenerators) {
      this.emailGeneratorMap.set(emailGenerator.type(), emailGenerator)
    }
  }

  public async dispatchEmail(map: Map<string, unknown>): Promise<Email> {
    const type = map.get('type') as string
    const emailGenerator = this.emailGeneratorMap.get(type)

    if (!emailGenerator) {
      throw new Error(`No email generator found for type: ${type}`)
    }

    let email = await emailGenerator.generateEmail(map)
    try {
      email = await this.emailService.saveEmail(email)
    } catch (err) {
      console.debug(err)
    }

    if (await this.emailDispatchScheduler.processEmail(email)) {
      await this.emailService.updateEmails([email])
    }

    return email
  }
}
