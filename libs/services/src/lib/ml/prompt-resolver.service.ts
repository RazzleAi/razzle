import { Configuration, OpenAIApi } from 'openai'
import { PROMPT_PREFIX } from './prompt-prefix'
import { times } from 'lodash'
import { ResolvedPromptParser, Step } from './resolved-prompt-parser'
import { StepDto } from '@razzle/dto'
import { Logger } from '@nestjs/common'
import { App, AppAction, AppActionParameter } from '../apps'
import { Gpt3 } from '../core/enginev2/llm/gpt3'

export class PromptResolverService {
  private readonly resolvedPromptParser = new ResolvedPromptParser()
  private logger = new Logger(PromptResolverService.name)

  openai = new OpenAIApi(
    new Configuration({
      apiKey: process.env.OPENAI_KEY,
    })
  )

  private gpt3 = new Gpt3(this.openai)

  async resolve(prompt: string, actionTable: string): Promise<string> {
    const promptToSend = `${PROMPT_PREFIX}${actionTable}\nInstruction:${prompt}\nDo your work below and do not include "Output:" in your response and do not include more inputs than specified in the action table\n`

    const response = await this.gpt3.accept(promptToSend, {
      model: 'text-davinci-003',
      temperature: 0,
    })

    const result = response.message

    return result ? result : ''
  }

  async handleMessage(prompt: string, apps: App[]): Promise<StepDto[]> {
    const actionTable = await this.generateActionTable(apps)
    console.debug('actionTable', actionTable)
    const extractionResult = await this.resolve(prompt, actionTable)

    const mrklResponse =
      this.resolvedPromptParser.parseMRKLResponse(extractionResult)

    return mrklResponse.map((step) =>
      this.addAdditionalDetailsToStep(step, apps)
    )
  }

  async generateActionTable(apps: App[]): Promise<string> {
    const appActionsList = apps
      .map((app) => {
        const actions =
          app.data && app.data.actions ? app.data.actions ?? [] : []

        const actionsList = actions.map((action) => ({
          actionDescription: action.description,
          actionName: action.name,
          actionParameterLength: action.parameters.length,
          actionParameters: action.parameters.map((a) => a.name),
        }))

        return actionsList
      })
      .flat()

    const longestParameterLength = Math.max(
      ...appActionsList.map((a) => a.actionParameterLength)
    )

    const inputs = times(longestParameterLength, (i) => {
      return `Input ${i + 1},`
    })

    const header = `Action Description,Action name,${inputs}`

    const rows = appActionsList.map((a) => {
      const inputs = times(longestParameterLength, (i) => {
        return a.actionParameters[i] || 'null'
      })

      return `${a.actionDescription},${a.actionName},${inputs}`
    })

    return [header, ...rows].join('\n')
  }

  addAdditionalDetailsToStep(step: Step, apps: App[]): StepDto {
    // Find the app with the ation name

    let app: App | undefined
    let appAction: AppAction | undefined

    for (const a of apps) {
      // If this app has not been synced yet, data will be null
      if (!a.data || !a.data.actions) {
        continue
      }

      const actions = a.data.actions as Array<AppAction>

      const action = actions.find(
        (a: AppAction) => a.name.toLowerCase() === step.action.toLowerCase()
      )

      if (action) {
        app = a
        appAction = action
      }
    }

    if (!app) {
      this.logger.warn(`Could not find app with action name ${step.action}`)

      return this.errorActionPlan()
    }

    if (!appAction) {
      this.logger.warn(`Action ${step.action} not found in app ${app}`)
      return this.errorActionPlan()
    }

    const parameters = appAction.parameters as Array<AppActionParameter>

    if (step.actionInput?.length !== parameters?.length) {
      this.logger.warn(
        `Action ${step.action} in app ${app} has ${parameters?.length} parameters but ${step.actionInput?.length} arguments were provided`
      )
      // return this.errorActionPlan()
    }

    if (!step.actionInput) {
      return this.errorActionPlan()
    }

    // Match the parameters with the arguments using the index
    const args = step.actionInput.map((arg, index) => {
      const parameter = parameters[index]

      return {
        name: parameter?.name as string,
        value: arg as any,
        type: parameter?.type as string,
      }
    })

    return {
      id: step.id,
      appId: app.id,
      razzleAppId: app.appId,
      appDescription: app.description,
      appName: app.name,
      actionDescription: appAction.description as string,
      actionInput: args,
      actionName: step.action,
      thought: step.thought,
      containsOutputHallucination: step.containsOutputHallucination,
    }
  }

  private errorActionPlan(): StepDto {
    return {
      isError: true,
      errorMessage: `Sorry, I don't know how to do that`,
      actionName: '',
      appName: '',
      razzleAppId: '',
      appId: '',
      appDescription: '',
      id: 1,
      actionDescription: '',
      actionInput: [],
      thought: '',
    }
  }
}
