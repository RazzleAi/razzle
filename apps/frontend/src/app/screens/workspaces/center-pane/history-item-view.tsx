import {
  ClientHistoryItemDto,
  ServerMessage,
  ServerMessageV2,
} from '@razzle/dto'
import React from 'react'
import { ClientMessageView } from './client-message-view'
import { Timestamp } from './timestamp'
import { ServerMessageView } from './server-message-view'

interface HistoryItemViewProps {
  item: ClientHistoryItemDto
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
  switch (props.item.message.__objType__) {
    case 'ServerMessage':
    case 'ServerMessageV2':
      return renderServerMessage(props)

    case 'ClientMessage':
    case 'ClientMessageV2':
    case 'ClientMessageV3':
      return (
        <ClientMessageView
          timestamp={props.item.timestampMillis}
          messageType={props.item.message.__objType__}
          message={props.item.message}
        />
      )

    default:
      return <div>Unknown message type</div>
  }
}

export function useMessageDetails() {
  return React.useContext(MessageDetailsCtx)
}

function renderServerMessage(props: HistoryItemViewProps) {
  const messageType = props.item.message.__objType__
  let message: ServerMessage | ServerMessageV2

  let appId
  let applicationId
  let appName
  let appDescription

  if (messageType === 'ServerMessage') {
    message = props.item.message as ServerMessage
    appId = message.data.appId
    applicationId = message.data.applicationId
    appName = message.data.appName
    appDescription = message.data.appDescription
  } else if (messageType === 'ServerMessageV2') {
    message = props.item.message as ServerMessageV2
    appId = message.data.payload.appId
    applicationId = message.data.payload.razzleAppId
    appName = message.data.payload.appName
    appDescription = message.data.payload.appDescription
  }
  return (
    <MessageDetailsCtx.Provider
      value={{
        appId: appId,
        applicationId: applicationId,
        appName: appName,
        appDescription: appDescription,
      }}
    >
      <div className="flex flex-col mb-5">
        <ServerMessageView
          isFramed={props.item.isFramed || false}
          frameId={props.frameId}
          message={message}
          messageType={messageType}
        />
        <div className="flex justify-start ml-2 mt-1">
          {/* TODO: show pill at top of screen showing date */}
          <Timestamp timestampMillis={props.item.timestampMillis} />
        </div>
      </div>
    </MessageDetailsCtx.Provider>
  )
}
