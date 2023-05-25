import { ChatHistoryItem } from '@razzle/services'
import { Timestamp } from './timestamp'
import { renderReponse } from '../../../utils/render-reponse'
import { IRazzleWidget } from '@razzle/widgets'

interface LlmMessageViewProps {
  historyItem: ChatHistoryItem
}

export function LlmMessageView(props: LlmMessageViewProps) {
  return (
    <div className="flex items-end mb-5">
      <div className="flex flex-col">
        <div className="flex bg-white rounded border border-[#E8EBED] h-full ">
          <div className="flex flex-col px-5 py-5 items-start justify-center">
            <div className="text-medium font-medium">
              {props.historyItem.text}
              {props.historyItem.agent ? (
                <div className="text-sm text-[#9CA3AF]">
                  {props.historyItem.agent.agentName}[
                  {props.historyItem.agent.agentPrompt}]
                </div>
              ) : null}
              {props.historyItem.agent?.agentResponse
                ? renderReponse(
                    props.historyItem.agent?.agentResponse
                      ?.ui as unknown as IRazzleWidget
                  )
                : null}
            </div>
          </div>
        </div>
        <div className="flex justify-end mr-2 mt-1">
          <Timestamp timestampMillis={props.historyItem.timestamp} />
        </div>
      </div>
    </div>
  )
}
