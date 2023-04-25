import { Onboarding } from '@prisma/client'

export type UpdateOnboardingInput = Partial<
  Omit<Onboarding, 'id' | 'userId' | 'accountId' | 'createdAt' | 'updatedAt'>
>

export interface OnboardingRepo {
  createOnboarding(accountId: string, userId: string): Promise<Onboarding>
  findByAccountId(accountId: string): Promise<Onboarding | null>
  updateOnboarding(id: string, data: UpdateOnboardingInput): Promise<void>
}
