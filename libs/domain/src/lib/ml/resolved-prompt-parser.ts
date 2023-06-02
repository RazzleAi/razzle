import { Logger } from '@nestjs/common'
import { ActionInput, StepDto } from '@razzle/dto'
import { RazzleResponse } from '@razzledotai/sdk'

export class ResolvedPromptParser {
  parse(resolvedPrompt: string): ActionPlan[] {
    /**
     * Actions can look like this:
     * [ [add "one" "two"], [add "3" "4"] ] => [ { actionName: 'add', args: ['one', 'two'] }, { actionName: 'add', args: ['3', '4'] } ]
     * [ [display { [add "one" "two"] }],  [add "5" "6"] ] => [ { actionName: 'display', args: [ { actionName: 'add', args: ['one', 'two'] } ] }, { actionName: 'add', args: ['5', '6'] } ]
     * write the code
     */

    const openStack: string[] = []
    const chars = resolvedPrompt.split('')

    const actions: ActionPlan[] = []

    let currentActionChars = []

    for (let i = 0; i < chars.length; i++) {
      const char = chars[i]

      if (char === '[') {
        openStack.push(char)
        continue
      } else if (char === ']') {
        openStack.pop()

        if (openStack.length === 1 && char === ']') {
          const action = this.parseAction(currentActionChars.join(''))
          actions.push(action)
          currentActionChars = []
        }

        continue
      }

      if (openStack.length >= 2) {
        currentActionChars.push(char)
      }
    }

    return actions
  }

  parseActionTemplate(resolvedPrompt: string): ActionPlan {
    const actionTemplate = resolvedPrompt.substring(
      1,
      resolvedPrompt.length - 1
    )
    const templateSplitIndex = actionTemplate.indexOf(' ')
    const actionName = actionTemplate.substring(0, templateSplitIndex)
    const argString = actionTemplate.substring(templateSplitIndex + 1)
    const regex = /"([^"]+)"/g

    let args = argString.match(regex)?.map((arg) => arg.replace(/"/g, ''))

    args = args || []

    return { actionName, args }
  }

  /**
   * 
   * @param response 

Step 2:
Thought: I need to get the book's ISBN
Action: get_book_isbn
Action Input: "{1}", "{3}"

Step 3:
Thought: I need to get the book's publisher
Action: get_book_publisher
Action Input: "{1}", "{3}"

Step 4:
Thought: I need to echo "The book's ISBN is {2} and publisher is {3}"
Action: echo
Action Input: "The book's ISBN is {2} and publisher is {3}"
   * @returns 
   */
  parseMRKLResponse(response: string): Step[] {
    const lines = response.split('\n')
    const steps: Step[] = []

    let id: number | null = null
    let thought: string | null = null
    let actionName: string | null = null
    let actionInput: string[] | null = null
    let output: string | null = null

    function addToStep() {
      if (id && thought && actionName && actionInput) {
        // If the output is not null that means the LLM most likely hallucinated an output
        const containsOutputHallucination = output !== null ? true : false

        steps.push({
          id,
          thought,
          action: actionName,
          actionInput,
          containsOutputHallucination,
        })

        id = null
        thought = null
        actionName = null
        actionInput = null
      }
    }

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].replace('\\s+', '').trim()
      if (line === '') {
        continue
      }

      if (line.startsWith('Step:')) {
        addToStep()

        id = parseInt(line.split(':')[1].trim())
      } else if (line.startsWith('Thought:')) {
        thought = line.split(':')[1].trim()
      } else if (line.startsWith('Action:')) {
        actionName = line.split(':')[1].trim()
      } else if (line.startsWith('Action Input:')) {
        const argString = line.split(':')[1]
        const regex = /"([^"]+)"/g
        actionInput =
          argString.match(regex)?.map((arg) => arg.replace(/"/g, '')) || []
      } else if (line.startsWith('Output:')) {
        output = line.replace('Output:', '').trim()
      }
    }

    addToStep()
    return steps
  }

  private parseAction(action: string): ActionPlan {
    const actionSplit = action.split(' "').map((s) => s.replace(/"/g, ''))

    const actionName = actionSplit[0]
    const args = actionSplit.slice(1).map((arg) => {
      return arg
      // if (arg.startsWith('{') && arg.endsWith('}')) {
      //   return this.parseAction(arg.slice(1, -1))
      // }

      // return arg.slice(1, -1)
    })

    return ActionPlanImpl.of({ actionName, args })
  }
}

export interface ActionPlan {
  appId?: string
  actionName: string
  args: string[]
}

export class ActionPlanImpl implements ActionPlan {
  constructor(public actionName: string, public args: string[]) {}

  public static of(plan: ActionPlan): ActionPlanImpl {
    return new ActionPlanImpl(plan.actionName, plan.args)
  }

  asString(): string {
    let argsString = ''
    this.args.forEach((arg) => {
      argsString += ` "${arg}"`
    })

    return `[${this.actionName}${argsString}]`
  }

  getUnresolvedArguments(): string[] {
    Logger.log(`'Action': ${this.asString()}`)
    return this.args.flatMap((a: string | ActionPlan): string[] => {
      if (typeof a === 'string') {
        return a.match(/{\d*}\.\?/g)?.map((s) => s) || []
      }

      return ActionPlanImpl.of(a as ActionPlan).getUnresolvedArguments()
    })
  }

  static unresolvedArguments(args: ActionInput[]): string[] {
    return args.flatMap((a: any): string[] => {
      return a.value.match(/{\d*}/g)?.map((s: string) => s) || []
    })
  }
}

export interface Step {
  id: number
  thought: string
  action: string
  actionInput?: (string | null)[]
  output?: RazzleResponse
  containsOutputHallucination?: boolean
}

export class StepImpl implements Step {
  constructor(
    public id: number,
    public thought: string,
    public action: string,
    public actionInput?: (string | null)[],
    public output?: RazzleResponse
  ) {}

  public static of(step: Step): StepImpl {
    return new StepImpl(
      step.id,
      step.thought,
      step.action,
      step.actionInput,
      step.output
    )
  }

  asString(): string {
    let actionInputString = ''
    if (this.actionInput) {
      for (let i = 0; i < this.actionInput.length; i++) {
        actionInputString += `"${this.actionInput[i]}", `
      }
    }

    if (actionInputString.length) {
      actionInputString = actionInputString.slice(0, -2)
    }

    let str = `\n\nStep: ${this.id}\nThought: ${this.thought}\nAction: ${this.action}\nAction Input: ${actionInputString}`

    if (this.output) {
      str += `\nOutput: ${JSON.stringify({
        data: this.output.data,
        error: this.output.error,
      })}`
    }

    return str
  }

  public static asString(steps: Step[]): string {
    return steps.map((s) => StepImpl.of(s).asString()).join('')
  }

  public static fromDto(stepDto: StepDto): Step {
    return new StepImpl(
      stepDto.id,
      stepDto.thought || '',
      stepDto.actionName,
      stepDto.actionInput.map((a) => a.value)
    )
  }
}

export class PromptAndSteps {
  constructor(public prompt: string, public steps: StepDto[]) {}
}
