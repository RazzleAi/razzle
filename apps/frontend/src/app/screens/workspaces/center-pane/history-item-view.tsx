// import React from 'react'
// import { ClientMessageView } from './client-message-view'
// import { ChatHistoryItem } from '@razzle/services'
// import { LlmMessageView } from './llm-message-view'

// interface HistoryItemViewProps {
//   item: ChatHistoryItem
//   frameId?: string
// }

// export interface MessageDetails {
//   appId?: string
//   applicationId?: string
//   appName?: string
//   appDescription?: string
// }

// export const MessageDetailsCtx = React.createContext<MessageDetails>({
//   appId: undefined,
//   applicationId: undefined,
//   appName: undefined,
//   appDescription: undefined,
// })

// export function HistoryItemView(props: HistoryItemViewProps) {
//   switch (props.item.role) {
//     case 'llm':
//       return renderServerMessage(props.item)

//     case 'user':
//       return <ClientMessageView historyItem={props.item} />

//     default:
//       return <div>Unknown message type</div>
//   }
// }

// export function useMessageDetails() {
//   return React.useContext(MessageDetailsCtx)
// }

// function renderServerMessage(props: ChatHistoryItem) {
//   return <LlmMessageView historyItem={props} />
// }

import React, { useState } from 'react'
import { ClientMessageView } from './client-message-view'
import { ChatHistoryItem } from '@razzle/services'
import { LlmMessageView } from './llm-message-view'
import { RiThumbUpLine, RiThumbDownLine } from 'react-icons/ri'

interface HistoryItemViewProps {
  item: ChatHistoryItem
  frameId?: string
}

export interface MessageDetails {
  appId?: string
  applicationId?: string
  appName?: string
  appDescription?: string
}

export const MessageDetailsCtx = React.createContext<MessageDetails>({
  appId: undefined,
  applicationId: undefined,
  appName: undefined,
  appDescription: undefined,
})

export function HistoryItemView(props: HistoryItemViewProps) {
  const [showReactions, setShowReactions] = useState(false)
  const [thumbsUp, setThumbsUp] = useState(false)
  const [thumbsDown, setThumbsDown] = useState(false)

  const handleMouseEnter = () => {
    setShowReactions(true)
  }

  const handleMouseLeave = () => {
    setShowReactions(false)
  }

  const handleThumbsUp = () => {
    setThumbsUp(!thumbsUp)
    setThumbsDown(false)
  }

  const handleThumbsDown = () => {
    setThumbsUp(false)
    setThumbsDown(!thumbsDown)
  }

  let messageContent

  switch (props.item.role) {
    case 'llm':
      messageContent = (
        <div
          className="flex items-start"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <LlmMessageView historyItem={props.item} />
          {showReactions && (
            <div className="flex cursor-pointer ml-2 mt-6">
              <div
                className={`reaction-icon ${thumbsUp ? 'active' : ''}`}
                onClick={handleThumbsUp}
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
                onClick={handleThumbsDown}
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
      )
      break

    case 'user':
      messageContent = <ClientMessageView historyItem={props.item} />
      break

    default:
      messageContent = <div>Unknown message type</div>
      break
  }

  return <>{messageContent}</>
}

export function useMessageDetails() {
  return React.useContext(MessageDetailsCtx)
}
