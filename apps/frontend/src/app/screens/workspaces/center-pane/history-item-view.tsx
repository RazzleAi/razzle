import React, { useState } from 'react'
import { ClientMessageView } from './client-message-view'
import { ChatHistoryItem } from '@razzle/services'
import { LlmMessageView } from './llm-message-view'
import { RiThumbUpLine, RiThumbDownLine } from 'react-icons/ri'
import { useWSClientStore } from '../../../stores/ws-client-store'
import { useFirebaseServices } from '../../../firebase'
import { useAppStore } from '../../../stores/app-store'
import { ReactionType } from '@razzle/dto'

type ReactionType = 'THUMBS_UP' | 'THUMBS_DOWN'

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
  const [thumbsUp, setThumbsUp] = useState<ReactionType | undefined>(
    props.item.userReaction === 'THUMBS_UP' ? 'THUMBS_UP' : undefined
  )
  const [thumbsDown, setThumbsDown] = useState<ReactionType | undefined>(
    props.item.userReaction === 'THUMBS_DOWN' ? 'THUMBS_DOWN' : undefined
  )

  const handleUserReaction = async (id: string, userReaction: ReactionType) => {
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
      setThumbsUp('THUMBS_UP')
      setThumbsDown(undefined)
    } else if (userReaction === 'THUMBS_DOWN') {
      setThumbsUp(undefined)
      setThumbsDown('THUMBS_DOWN')
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
          <LlmMessageView
            historyItem={props.item}
            showReactions={showReactions}
            thumbsUp={thumbsUp === 'THUMBS_UP'}
            thumbsDown={thumbsDown === 'THUMBS_DOWN'}
            handleUserReaction={handleUserReaction}
          />
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
