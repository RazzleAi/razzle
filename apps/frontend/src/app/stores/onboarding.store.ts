import { OnboardingDto } from '@razzle/dto'
import create from 'zustand'
import { devtools } from 'zustand/middleware'

export interface OnboardingStore {
  onboarding?: OnboardingDto
  setOnboarding: (onboarding: OnboardingDto) => void
}

export const useOnboardingStore = create<OnboardingStore>()(
  devtools((set, get) => ({
    onboarding: undefined,
    setOnboarding: (onboarding: OnboardingDto) => {
      set((state) => ({ ...state, onboarding }))
    },
  }))
)
