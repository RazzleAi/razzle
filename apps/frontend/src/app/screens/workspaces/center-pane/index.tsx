/* eslint-disable jsx-a11y/anchor-is-valid */
import { HotKeyStack } from '../../../hooks'
import { MessagePane } from './message-pane'
import PromptField from './prompt-field'

export function CenterPane() {
  return (
    <div className="flex flex-col w-full h-[100%] bg-gray-50">
      <div className="flex flex-col w-full h-[calc(100vh-200px)] py-3 px-5 overflow-y-scroll">
        <MessagePane />
      </div>
      <div className="flex flex-col w-full  px-5">
        <div className="flex flex-col w-full h-full relative">
          <div className="w-full">
            <HotKeyStack.Provider value={[]}>
              <PromptField />
            </HotKeyStack.Provider>
          </div>
        </div>
      </div>
    </div>
  )
}
