/**
 * We need to resolve the:
 * - How to call the agent and get output for an action
 * - How to call GPT and get output including previous prompts
 */

import { StepDto } from '@razzle/dto'
import { ActionPlanImpl, PromptResolverService, Step, StepImpl } from '../../ml'
import { SequencerInput, SequencerOutput } from './sequencer-types'
import { AgentCaller } from './agent-caller'

export class Sequencer {
  constructor(
    private readonly agentCaller: AgentCaller,
    private readonly promptResolverService: PromptResolverService
  ) {}

  async execute(sequencerInput: SequencerInput): Promise<Step | null> {
    const { userId, accountId, promptSteps, headers } = sequencerInput
    const steps = promptSteps.steps

    const context = []

    let output: SequencerOutput = await this.resolveSteps(
      userId,
      accountId,
      steps,
      headers
    )
    context.push(...output.steps)

    while (!output.resolved) {
      const steps = await this.promptResolverService.handleMessage(
        promptSteps.prompt + '\n' + StepImpl.asString(context),
        sequencerInput.appsInWorkspace || []
      )

      output = await this.resolveSteps(userId, accountId, steps, headers)
      context.push(...output.steps)
    }

    return Promise.resolve(
      output.steps.length ? output.steps[output.steps.length - 1] : null
    )
  }

  private async resolveSteps(
    userId: string,
    accountId: string,
    steps: StepDto[],
    headers?: Record<string, any>
  ): Promise<SequencerOutput> {
    const stepResult: Step[] = []
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      const action = step.actionName
      const unresolvedArgs = ActionPlanImpl.unresolvedArguments(
        step.actionInput
      )

      if (unresolvedArgs.length > 0) {
        console.warn(`Unresolved arguments: ${unresolvedArgs.join(', ')}`)
        if (i === 0) {
          throw new Error(
            `Cannot resolve arguments for first step: ${JSON.stringify(step)}`
          )
        }

        return this.buildSequencerOutput(stepResult)
      }

      const stepResponse = await this.processStep(
        userId,
        accountId,
        step,
        headers
      )

      stepResult.push(stepResponse)

      const isErrorResponse = stepResponse.output?.error ? true : false

      if (isErrorResponse || step.containsOutputHallucination) {
        return this.buildSequencerOutput(stepResult)
      }
    }

    return Promise.resolve({
      resolved: true,
      steps: stepResult,
    })
  }

  private buildSequencerOutput(
    previousSteps: Step[]
  ): SequencerOutput | PromiseLike<SequencerOutput> {
    return {
      resolved: false,
      steps: previousSteps.map((s) => {
        return {
          id: s.id,
          thought: s.thought,
          action: s.action,
          actionInput: s.actionInput,
          output: s.output,
        }
      }),
    }
  }

  private async processStep(
    userId: string,
    accountId: string,
    step: StepDto,
    headers?: Record<string, unknown>
  ): Promise<Step> {
    const args = step.actionInput.map((a) => a.value)
    const response = await this.agentCaller.callAction({
      userId,
      accountId,
      action: {
        appId: step.razzleAppId,
        actionName: step.actionName,
        args: step.actionInput,
      },
      headers,
    })

    return {
      id: step.id,
      thought: step.thought!, // TODO: revisit this type
      action: step.actionName,
      actionInput: args,
      output: response,
    }
  }
}
