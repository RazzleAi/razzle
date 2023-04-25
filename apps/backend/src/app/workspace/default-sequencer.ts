// import { Injectable, Logger } from '@nestjs/common'
// import { App, Prisma } from '@prisma/client'
// import { StepDto } from '@razzle/dto'
// import {
//   ActionPlanImpl,  
//   Step,
//   StepImpl,
// } from '@razzle/services'
// import { AgentImpl } from '../agent/agent'
// import { PromptResolverServiceImpl } from '../ml/args-extractor.service.impl'

// @Injectable()
// export class DefaultSequencer implements Sequencer {
//   constructor(
//     private agent: AgentImpl,
//     private readonly promptResolverService: PromptResolverServiceImpl
//   ) {}

//   async resolveSteps(
//     userId: string,
//     accountId: string,
//     steps: StepDto[],
//     headers?: Record<string, any>
//   ): Promise<SequencerOutput> {
//     const stepResult: Step[] = []
//     for (let i = 0; i < steps.length; i++) {
//       const step = steps[i]
//       const action = step.actionName
//       const unresolvedArgs = ActionPlanImpl.unresolvedArguments(
//         step.actionInput
//       )

//       if (unresolvedArgs.length > 0) {
//         Logger.log(`Unresolved arguments: ${unresolvedArgs.join(', ')}`)
//         if (i === 0) {
//           throw new Error(
//             `Cannot resolve arguments for first step: ${JSON.stringify(step)}`
//           )
//         }

//         return this.buildSequencerOut(stepResult)
//       }

//       const stepResponse = await this.processStep(
//         userId,
//         accountId,
//         step,
//         headers
//       )

//       stepResult.push(stepResponse)

//       const isErrorResponse = stepResponse.output?.error ? true : false

//       if (isErrorResponse || step.containsOutputHallucination) {
//         return this.buildSequencerOut(stepResult)
//       }
//     }

//     return Promise.resolve({
//       resolved: true,
//       steps: stepResult,
//     })
//   }

//   private buildSequencerOut(
//     previousSteps: Step[]
//   ): SequencerOutput | PromiseLike<SequencerOutput> {
//     return {
//       resolved: false,
//       steps: previousSteps.map((s) => {
//         return {
//           id: s.id,
//           thought: s.thought,
//           action: s.action,
//           actionInput: s.actionInput,
//           output: s.output,
//         }
//       }),
//     }
//   }

//   async processStep(
//     userId: string,
//     accountId: string,
//     step: StepDto,
//     headers?: Record<string, any>
//   ): Promise<Step> {
//     const args = step.actionInput.map((a) => a.value)
//     const response = await this.agent.callAction({
//       userId,
//       accountId,
//       action: {
//         appId: step.appId,
//         actionName: step.actionName,
//         args: step.actionInput,
//       },
//       headers,
//     })

//     return {
//       id: step.id,
//       thought: step.thought,
//       action: step.actionName,
//       actionInput: args,
//       output: response,
//     }
//   }

//   async generatePromptTrainingData(apps: App[]): Promise<string[]> {
//     return apps
//       .map((app) => {
//         const actions = app.data
//           ? (app.data as Prisma.JsonObject)['actions']
//           : []

//         const examples = (actions as Prisma.JsonArray).map(
//           (action: any) =>
//             `${
//               action.description
//             }:                                                        [${
//               action.name
//             } ${action.parameters.map((a: any) => `<${a.name}>`)} ]`
//         )

//         return examples
//       })
//       .flat()
//   }

//   async execute(sequencerInput: SequencerInput): Promise<Step | null> {
//     const { userId, accountId, promptSteps, headers } = sequencerInput
//     const steps = promptSteps.steps

//     const context = []

//     let output: SequencerOutput = await this.resolveSteps(
//       userId,
//       accountId,
//       steps,
//       headers
//     )

//     context.push(...output.steps)

//     while (!output.resolved) {
//       const steps = await this.promptResolverService.handleMessage(
//         promptSteps.prompt + '\n' + StepImpl.asString(context),
//         sequencerInput.appsInWorkspace
//       )

//       output = await this.resolveSteps(userId, accountId, steps, headers)
//       context.push(...output.steps)
//     }

//     return Promise.resolve(
//       output.steps.length ? output.steps[output.steps.length - 1] : null
//     )
//   }
// }
