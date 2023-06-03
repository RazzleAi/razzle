import { RazzleResponse } from '@razzle/sdk'
import { IAgent, NlpProxyAgentAcceptParams } from './agent'
import { PromptResolverService } from '../../../ml'
import { App } from '../../../apps'
import { Sequencer } from '../../engine/sequencer'

export class NlpProxyAgent implements IAgent {
  constructor(
    private readonly app: App,
    private readonly promptResolverService: PromptResolverService,
    private readonly sequencer: Sequencer
  ) {
    console.log(`Initializing NlpProxyAgent for app ${app.name}`)
    this.name = app.name
    this.description = app.description
  }
  name: string
  description: string

  async accept(params: NlpProxyAgentAcceptParams): Promise<RazzleResponse> {
    const resolvedSteps = await this.promptResolverService.handleMessage(
      params.prompt,
      [this.app]
    )

    const executionFinalStep = await this.sequencer.execute({
      accountId: params.accountId,
      workspaceId: params.workspaceId,
      userId: params.userId,
      appsInWorkspace: [this.app],
      promptSteps: {
        prompt: params.prompt,
        steps: resolvedSteps,
      },
    })

    if (!executionFinalStep || !executionFinalStep.output) {
      throw new Error('NlpProxyAgent: Prompt execution failed, no output')
    }

    return executionFinalStep?.output
  }
}
