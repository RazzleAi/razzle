import { App } from "../../apps"
import { PromptAndSteps, Step } from "../../ml"

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