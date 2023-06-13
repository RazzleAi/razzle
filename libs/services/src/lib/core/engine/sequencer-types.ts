import { App } from '../../apps'
import { PromptAndSteps, Step } from '../../ml'

export interface SequencerInput {
  userId: string

  accountId: string

  promptSteps: PromptAndSteps

  headers?: Record<string, any>
  appsInWorkspace?: App[]
}

export interface SequencerOutput {
  resolved: boolean
  agentError?: string
  steps: Step[]
}
