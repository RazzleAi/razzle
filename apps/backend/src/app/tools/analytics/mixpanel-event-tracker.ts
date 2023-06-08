import { Injectable } from '@nestjs/common'
import { AnalyticsEventTracker } from '@razzle/services'
import * as Mixpanel from 'mixpanel'

@Injectable()
export class MixpanelEventTracker implements AnalyticsEventTracker {
  private mixpanel: Mixpanel.Mixpanel

  constructor() {
    this.mixpanel = Mixpanel.init(process.env.MIXPANEL_TOKEN)
  }

  trackEvent(event: string, properties?: any): void {
    this.mixpanel.track(event, { ...properties, nodeEnv: process.env.NODE_ENV })
  }

  identify(userId: string, email?: string): void {
    this.mixpanel.people.set(userId, {
      $email: email,
    })
  }
}
