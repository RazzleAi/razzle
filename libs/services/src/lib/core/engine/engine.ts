import { ClientResponse, ClientToEngineRequest, StepDto } from '@razzle/dto'
import { AccountService } from '../../account'
import { PromptAndSteps, PromptResolverService } from '../../ml'
import { UserService } from '../../user'
import { Sequencer } from './sequencer'
import { RazzleResponse } from '@razzledotai/sdk'
import { ClientToEngineMessenger } from '../messaging'
import { AgentCaller } from './agent-caller'

export class RazzleEngine {
  private readonly sequencer: Sequencer
  constructor(
    private readonly clientMessenger: ClientToEngineMessenger,
    agentCaller: AgentCaller,
    private readonly promptResolverService: PromptResolverService,
    private readonly userService: UserService,
    private readonly accountService: AccountService
  ) {
    this.sequencer = new Sequencer(agentCaller, this.promptResolverService)
    this.clientMessenger.onRequestReceivedFromClient(
      this.handlePromptMessageFromClient.bind(this)
    )
  }

  public async handlePromptMessageFromClient(message: ClientToEngineRequest) {
    const accountId = message.accountId
    const workspaceId = message.workspaceId
    const userId = message.userId
    const clientId = message.clientId
    const prompt = message.payload.prompt as string

    const apps = await this.accountService.getAppsInAccount(accountId)
    const steps = await this.promptResolverService.handleMessage(prompt, apps)

    const promptAndSteps = {
      prompt,
      steps,
    }
    const result = await this.executePromptSteps(
      workspaceId,
      userId,
      accountId,
      promptAndSteps,
      message.headers
    )

    if (!result) {
      console.warn(
        'Engine.executePromptSteps: Prompt execution failed. Cannot execute prompt',
        { userId, prompt: promptAndSteps.prompt }
      )
      return
    }

    const [step, output] = result
    const clientResponse: ClientResponse = {
      clientId,
      headers: {
        ...message.headers,
      },
      payload: {
        ...output,
        userId,
        workspaceId,
        clientId,
        accountId,
        appId: step.appId,
        razzleAppId: step.razzleAppId,
        appName: step.appName,
        appDescription: step.appDescription,
        requestPrompt: prompt,
      },
    }
    try {
      await this.clientMessenger.sendResponseToClient(clientId, clientResponse)
    } catch (e) {
      console.error(
        'Engine.handlePromptMessageFromClient Error sending ClientResponse to client',
        e
      )
    }
  }

  private async executePromptSteps(
    worpspaceId: string,
    userId: string,
    accountId: string,
    promptAndSteps: PromptAndSteps,
    headers: Record<string, unknown> = {}
  ): Promise<[StepDto, RazzleResponse] | null> {
    const user = await this.userService.findById(userId)
    if (!user) {
      console.warn(
        'Engine.executePromptSteps: User not found. Cannot execute prompt',
        { userId, prompt: promptAndSteps.prompt }
      )
      return null
    }

    const result = await this.executePrompt(
      worpspaceId,
      userId,
      accountId,
      promptAndSteps,
      headers
    )

    return result
  }

  async executePrompt(
    workspaceId: string,
    userId: string,
    accountId: string,
    promptSteps: PromptAndSteps,
    headers: Record<string, unknown> = {}
  ): Promise<[StepDto, RazzleResponse] | null> {
    const apps = (await this.accountService.getAppsInAccount(accountId)).filter(
      (a) => a.data != null
    )

    const step = await this.sequencer.execute({
      workspaceId,
      userId,
      accountId,
      promptSteps,
      headers,
      appsInWorkspace: apps,
    })

    if (!step) {
      return null // should this be an error?
    }

    const dto = this.promptResolverService.addAdditionalDetailsToStep(
      step,
      apps
    )

    return [dto, step.output]
  }
}
