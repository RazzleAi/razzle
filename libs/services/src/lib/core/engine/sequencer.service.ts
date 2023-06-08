import { App } from '../../apps'
import { PromptAndSteps, Step } from '../../ml/resolved-prompt-parser'

/**
 * We need to resolve the:
 * - How to call the agent and get output for an action
 * - How to call GPT and get output including previous prompts
 */

export interface Sequencer {
  execute(input: SequencerInput): Promise<Step | null>
}

export interface SequencerInput {
  workspaceId: string

  userId: string

  accountId: string

  promptSteps: PromptAndSteps

  headers?: Record<string, any>
  appsInWorkspace?: App[]
}

export interface SequencerOutput {
  resolved: boolean

  steps: Step[]
}
