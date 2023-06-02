import { Injectable } from '@nestjs/common'
import { OnboardingService } from '@razzle/domain'
import { EventBusImpl } from '../event/event-bus-impl'
import { OnboardingRepoImpl } from './onboarding.repo-impl'

@Injectable()
export class OnboardingServiceImpl extends OnboardingService {
  constructor(onboardingRepo: OnboardingRepoImpl, eventBus: EventBusImpl) {
    super(onboardingRepo, eventBus)
  }
}
