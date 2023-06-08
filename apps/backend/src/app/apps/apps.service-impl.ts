import { Injectable } from '@nestjs/common'
import { AppsService } from '@razzle/services'
import { MixpanelEventTracker } from '../tools/analytics/mixpanel-event-tracker'
import { EventBusImpl } from '../tools/event/event-bus-impl'
import { EmbeddingServiceImpl } from '../ml/emedding.service.impl'
import { AppsRepoImpl } from './apps.repo.impl'

@Injectable()
export class AppsServiceImpl extends AppsService {
  constructor(
    repo: AppsRepoImpl,
    embeddingServiceImpl: EmbeddingServiceImpl,
    eventBus: EventBusImpl,
    analyticsEventTracker: MixpanelEventTracker
  ) {
    super(repo, embeddingServiceImpl, eventBus, analyticsEventTracker)
  }
}
