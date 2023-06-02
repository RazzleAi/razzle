import { ActionPlan, ResolvedPromptParser } from '../../../src/lib/ml'
// import { Sequencer, DefaultSequencer } from '../../../src/lib/workspace'

describe('Tests Sequencer Service', () => {
  // it ('should resolve a sequence with unresolved args', async () => {
  //     const sequencer: Sequencer = new DefaultSequencer(new ResolvedPromptParser())
  //     const steps = await sequencer.resolveSequence(
  //         `
  //         Step: 1
  //         Thought: I need to get all the transactions that happened today
  //         Action: [get_transactions "today" "today"]
  //         Step: 2
  //         Thought: I need to create a new list called fruits
  //         Action: [create_new_List "fruits"]
  //         Step: 3
  //         Thought: I need to add cherry to the list called fruits
  //         Action: [add_to_list "cherry" "{1}.?"]
  //         Step: 4
  //         Thought: I need to add tomato to the list called fruits
  //         Action: [add_to_list "tomato" "{1}.?"]
  //         Step: 5
  //         Thought: I need to add mangoes to the list called fruits
  //         Action: [add_to_list "mangoes" "{1}.?"]
  //         `
  //     )
  //     console.log(`Steps: ${JSON.stringify(steps)}`);
  //     expect(steps).toHaveLength(2)
  //     expect(steps).toEqual(
  //         [
  //             {
  //               "id": 1,
  //               "thought": "I need to get all the transactions that happened today",
  //               "action": { "actionName": "get_transactions", "args": ["today", "today"] },
  //               "output": "{'id': '1', 'name' : 'test'}"
  //             },
  //             {
  //               "id": 2,
  //               "thought": "I need to create a new list called fruits",
  //               "action": { "actionName": "create_new_List", "args": ["fruits"] },
  //               "output": "{'id': '1', 'name' : 'test'}"
  //             }
  //           ]
  //     )
  // });
  // it ('should resolve a sequence with no unresolved args', async () => {
  //     const sequencer: Sequencer = new DefaultSequencer(new ResolvedPromptParser())
  //     const steps = await sequencer.resolveSequence(
  //         `
  //         Step: 1
  //         Thought: I need to get all the transactions that happened today
  //         Action: [get_transactions "today" "today"]
  //         Step: 2
  //         Thought: I need to create a new list called fruits
  //         Action: [create_new_List "fruits"]
  //         Step: 3
  //         Thought: I need to add cherry to the list called fruits
  //         Action: [add_to_list "cherry" "1"]
  //         Step: 4
  //         Thought: I need to add tomato to the list called fruits
  //         Action: [add_to_list "tomato" "1"]
  //         `
  //     )
  //     console.log(`Steps: ${JSON.stringify(steps)}`);
  //     expect(steps).toHaveLength(4)
  //     expect(steps).toEqual(
  //         [
  //             {
  //               "id": 1,
  //               "thought": "I need to get all the transactions that happened today",
  //               "action": { "actionName": "get_transactions", "args": ["today", "today"] }
  //             },
  //             {
  //               "id": 2,
  //               "thought": "I need to create a new list called fruits",
  //               "action": { "actionName": "create_new_List", "args": ["fruits"] }
  //             },
  //             {
  //               "id": 3,
  //               "thought": "I need to add cherry to the list called fruits",
  //               "action": { "actionName": "add_to_list", "args": ["cherry", "1"] }
  //             },
  //             {
  //               "id": 4,
  //               "thought": "I need to add tomato to the list called fruits",
  //               "action": { "actionName": "add_to_list", "args": ["tomato", "1"] }
  //             }
  //           ]
  //     )
  // });
})
