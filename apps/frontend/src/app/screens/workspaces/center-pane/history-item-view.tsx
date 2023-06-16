import React, { useState } from 'react'
import { ClientMessageView } from './client-message-view'
import { ChatHistoryItem } from '@razzle/services'
import { LlmMessageView } from './llm-message-view'
import { RiThumbUpLine, RiThumbDownLine } from 'react-icons/ri'
import { useWSClientStore } from '../../../stores/ws-client-store'
import { useFirebaseServices } from '../../../firebase'
import { useAppStore } from '../../../stores/app-store'

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
  const { sendMessage } = useWSClientStore()
  const { currentUser } = useFirebaseServices()
  const { account } = useAppStore()
  const [thumbsUp, setThumbsUp] = useState(
    props.item.userReaction === 'THUMBS_UP'
  )
  const [thumbsDown, setThumbsDown] = useState(
    props.item.userReaction === 'THUMBS_DOWN'
  )

  const handleUserReaction = async (id: string, userReaction: string) => {
    const accessToken = await currentUser.getIdToken()
    await sendMessage(accessToken, {
      event: 'ReactToLLMMessage',
      data: {
        accountId: account.id,
        payload: {
          id,
          userReaction,
        },
      },
    })

    // Update the reaction state in the component
    if (userReaction === 'THUMBS_UP') {
      setThumbsUp(true)
      setThumbsDown(false)
    } else if (userReaction === 'THUMBS_DOWN') {
      setThumbsUp(false)
      setThumbsDown(true)
    }
  }

  const handleMouseEnter = () => {
    setShowReactions(true)
  }

  const handleMouseLeave = () => {
    setShowReactions(false)
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
                onClick={() => handleUserReaction(props.item.id, 'THUMBS_UP')}
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
                onClick={() => handleUserReaction(props.item.id, 'THUMBS_DOWN')}
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
