import React from 'react'
import { ClientMessageView } from './client-message-view'
import { ChatHistoryItem } from '@razzle/services'
import { LlmMessageView } from './llm-message-view'

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
  switch (props.item.role) {
    case 'llm':
      return renderServerMessage(props.item)

    case 'user':
      return <ClientMessageView historyItem={props.item} />

    default:
      return <div>Unknown message type</div>
  }
}

export function useMessageDetails() {
  return React.useContext(MessageDetailsCtx)
}

function renderServerMessage(props: ChatHistoryItem) {
  return <LlmMessageView historyItem={props} />
}
