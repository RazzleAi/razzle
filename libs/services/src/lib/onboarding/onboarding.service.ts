import { OnboardingDto, UpdateOnboardingDto } from '@razzle/dto'
import {
  AccountCreatedEventPayload,
  ACCOUNT_CREATED_EVENT,
  AppCreatedEventPayload,
  EventBus,
  FIRST_APP_CREATED_EVENT,
  FIRST_APP_SYNCED_EVENT,
} from '../event'
import { OnboardingRepo } from './onboarding.repo'

export class OnboardingService {
  constructor(
    private readonly onboardingRepo: OnboardingRepo,
    eventBus: EventBus
  ) {
    this.handleEvents(eventBus)
  }

  async createOnboarding(accountId: string, userId: string): Promise<void> {
    await this.onboardingRepo.createOnboarding(accountId, userId)
  }

  async findByAccountId(accountId: string): Promise<OnboardingDto | null> {
    return this.onboardingRepo.findByAccountId(accountId)
  }

  async updateOnboardingByAccountId(
    accountId: string,
    data: UpdateOnboardingDto
  ): Promise<void> {
    const onboarding = await this.onboardingRepo.findByAccountId(accountId)
    if (!onboarding) {
      throw new Error('Onboarding not found')
    }

    await this.onboardingRepo.updateOnboarding(onboarding.id, data)
  }

  private handleEvents(eventBus: EventBus) {
    eventBus.on(ACCOUNT_CREATED_EVENT, async (payload: unknown) => {
      const data = payload as AccountCreatedEventPayload
      await this.createOnboarding(data.id, data.userId)
    })

    eventBus.on(FIRST_APP_CREATED_EVENT, async (payload: unknown) => {
      const data = payload as AppCreatedEventPayload
      await this.updateOnboardingByAccountId(data.accountId, {
        appCreated: true,
      })
    })

    eventBus.on(FIRST_APP_SYNCED_EVENT, async (payload: unknown) => {
      const data = payload as AppCreatedEventPayload
      await this.updateOnboardingByAccountId(data.accountId, {
        appSynced: true,
      })
    })
  }
}
