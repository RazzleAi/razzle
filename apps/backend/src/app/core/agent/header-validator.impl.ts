import { Injectable, Logger } from '@nestjs/common'
import { AgentHeaderValidator, App } from '@razzle/services'
import { AppsServiceImpl } from '../../apps/apps.service-impl'

@Injectable()
export class AgentHeaderValidatorImpl implements AgentHeaderValidator {
  private logger: Logger = new Logger(AgentHeaderValidatorImpl.name)
  app: App
  constructor(private readonly appsService: AppsServiceImpl) {}

  async validateHeaders(
    headers: Record<string, string | string[]>
  ): Promise<boolean> {
    const validateStringHeader = (key: string): boolean => {
      if (!headers[key] || typeof headers[key] !== 'string') {
        this.logger.log(`Missing header ${key}`)
        return false
      }
      return true
    }

    if (!validateStringHeader('app_id') || !validateStringHeader('api_key')) {
      return false
    }

    const appId = headers['app_id'] as string
    const app = await this.appsService.findByAppId(appId)
    if (!app) {
      this.logger.log(`App with ID ${appId} does not exist`)
      return false
    }

    const apiKey = headers['api_key'] as string
    if (app.apiKey !== apiKey) {
      this.logger.log(`Invalid API key ${apiKey}`)
      return false
    }

    this.app = app
    return true
  }
}
