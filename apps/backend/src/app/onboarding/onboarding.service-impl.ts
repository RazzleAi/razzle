import { Injectable } from '@nestjs/common'
import { OnboardingService } from '@razzle/services'
import { EventBusImpl } from '../tools/event/event-bus-impl'
import { OnboardingRepoImpl } from './onboarding.repo-impl'

@Injectable()
export class OnboardingServiceImpl extends OnboardingService {
  constructor(onboardingRepo: OnboardingRepoImpl, eventBus: EventBusImpl) {
    super(onboardingRepo, eventBus)
  }
}
