import { ActionPlan, ResolvedPromptParser } from '../../../src/lib/ml'

describe('Tests ResolvedPromptParser', () => {
  it('should parse a resolved prompt', () => {
    const resolvedPrompt = '[ [add "one" "two"], [add "3" "4"] ]'
    const resolvedPromptParser = new ResolvedPromptParser()
    const actions = resolvedPromptParser.parse(resolvedPrompt)
    expect(actions).toEqual([
      {
        actionName: 'add',
        args: ['one', 'two'],
      },
      {
        actionName: 'add',
        args: ['3', '4'],
      },
    ])
  })

  it('should parse a resolved prompt with date args', () => {
    const resolvedPrompt = '[ [getTodos "three days ago" "now"] ]'
    const resolvedPromptParser = new ResolvedPromptParser()
    const actions = resolvedPromptParser.parse(resolvedPrompt)
    expect(actions).toEqual([
      {
        actionName: 'getTodos',
        args: ['three days ago', 'now'],
      },
    ])
  })

  it('should parse a MRKL response into Steps', () => {
    const parser = new ResolvedPromptParser()
    const steps = parser.parseMRKLResponse(
      `Step: 2
            Thought: I need to get the book's ISBN
            Action: get_book_isbn
            Action Input: "{1}", "{3}"
            
            Step: 3
            Thought: I need to get the book's publisher
            Action: get_book_publisher
            Action Input: "{1}", "{3}"

            Step: 4
            Thought: I need to echo "The book's ISBN is {2} and publisher is {3}"
            Action: echo
            Action Input: "The book's ISBN is {2} and publisher is {3}"
            `
    )

    expect(steps).toHaveLength(3)
    // expect(steps[0].thought).toEqual('I need to get all the transactions that happened today')
    // expect(steps[0].action).toEqual({
    //     actionName: 'get_transactions',
    //     args: ['today', 'today']
    // })
    // expect(steps[1].thought).toEqual('I need to create a new list called fruits')
    // expect(steps[1].action).toEqual({
    //     actionName: 'create_new_List',
    //     args: ['fruits']
    // })
    // expect(steps[2].thought).toEqual('I need to add cherry to the list called fruits')
    // expect(steps[2].action).toEqual({
    //     actionName: 'add_to_list',
    //     args: ['cherry', '{1}.?']
    // })
    // expect(steps[3].thought).toEqual('I need to add tomato to the list called fruits')
    // expect(steps[3].action).toEqual({
    //     actionName: 'add_to_list',
    //     args: ['tomato', '{1}.?']
    // })
    // expect(steps[4].thought).toEqual('I need to add mangoes to the list called fruits')
    // expect(steps[4].action).toEqual({
    //     actionName: 'add_to_list',
    //     args: ['mangoes', '{1}.?']
    // })
  })

  it('should properly capture unresolved arguments', () => {
    // let action = {
    //     actionName: 'add',
    //     args: ['one', 'two'],
    // }
    // let unresolvedArgs = ActionPlanValidator.getUnresolvedArguments(action as ActionPlan)
    // expect(unresolvedArgs).toHaveLength(0)
    // action = {
    //     actionName: 'add',
    //     args: ['one', '{1}.?', '{11}.?'],
    // }
    // unresolvedArgs = ActionPlanValidator.getUnresolvedArguments(action)
    // expect(unresolvedArgs).toHaveLength(2)
    // expect(unresolvedArgs).toEqual(['{1}.?', '{11}.?'])
  })
})
