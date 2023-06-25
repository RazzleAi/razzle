import { Injectable } from '@nestjs/common'
import { AgentSyncService } from '@razzle/services'
import { AppsServiceImpl } from '../../apps/apps.service-impl'
import { EventBusImpl } from '../../tools/event/event-bus-impl'
import { MixpanelEventTracker } from '../../tools/analytics/mixpanel-event-tracker'

@Injectable()
export class AgentSyncServiceImpl extends AgentSyncService {
  constructor(
    appsService: AppsServiceImpl,
    eventBus: EventBusImpl,
    analyticsEventTracker: MixpanelEventTracker
  ) {
    super(appsService, eventBus, analyticsEventTracker)
  }
}
