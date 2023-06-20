import React from 'react'
import { ChatHistoryItem } from '@razzle/services'
import { Timestamp } from './timestamp'
import { renderReponse } from '../../../utils/render-reponse'
import { IRazzleWidget } from '@razzle/widgets'
import { RiThumbUpLine, RiThumbDownLine } from 'react-icons/ri'

interface LlmMessageViewProps {
  historyItem: ChatHistoryItem
  showReactions: boolean
  thumbsUp: boolean
  thumbsDown: boolean
  handleUserReaction: (id: string, userReaction: string) => void
}

export function LlmMessageView(props: LlmMessageViewProps) {
  const {
    historyItem,
    showReactions,
    thumbsUp,
    thumbsDown,
    handleUserReaction,
  } = props

  return (
    <div className="flex flex-col">
      <div className="flex bg-white rounded border border-[#E8EBED] h-full">
        <div className="flex flex-col px-5 py-5 items-start justify-center">
          <div className="text-medium font-medium">
            {historyItem.text}
            {historyItem.agent ? (
              <div className="text-sm text-[#9CA3AF]">
                {historyItem.agent.agentName}[{historyItem.agent.agentPrompt}]
              </div>
            ) : null}
            {historyItem.agent?.agentResponse
              ? renderReponse(
                  historyItem.agent?.agentResponse
                    .ui as unknown as IRazzleWidget
                )
              : null}
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between mr-2 mt-1">
        <div>
          {showReactions && (
            <div className="flex cursor-pointer">
              <div
                className={`reaction-icon ${thumbsUp ? 'active' : ''}`}
                onClick={() => handleUserReaction(historyItem.id, 'THUMBS_UP')}
              >
                <RiThumbUpLine
                  className={`text-x transition-colors ${
                    thumbsUp
                      ? 'text-electricIndigo-500'
                      : 'text-gray-500 hover:text-electricIndigo-500'
                  }`}
                />
              </div>
              <div
                className={`reaction-icon ml-2 ${thumbsDown ? 'active' : ''}`}
                onClick={() =>
                  handleUserReaction(historyItem.id, 'THUMBS_DOWN')
                }
              >
                <RiThumbDownLine
                  className={`text-x transition-colors ${
                    thumbsDown
                      ? 'text-red-500'
                      : 'text-gray-500 hover:text-red-500'
                  }`}
                />
              </div>
            </div>
          )}
        </div>
        <Timestamp timestampMillis={historyItem.timestamp} />
      </div>
    </div>
  )
}
