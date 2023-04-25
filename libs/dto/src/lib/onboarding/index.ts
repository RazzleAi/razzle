export type UpdateOnboardingDto = Partial<{
  appCreated: boolean
  appSynced: boolean
  firstActionTriggered: boolean
  promptTriggered: boolean
}>

export interface OnboardingDto {
  id: string
  accountId: string
  userId: string
  appCreated: boolean
  appSynced: boolean
  firstActionTriggered: boolean
  promptTriggered: boolean
}
