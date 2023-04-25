import {
  CallActionData,
  ClientMessage,
  ClientMessageV2,
  ClientMessageV3,
} from '@razzle/dto'
import { varNameToName } from '../../../utils/var-to-sentence'
import { Timestamp } from './timestamp'

interface ClientMessageViewProps {
  messageType: 'ClientMessage' | 'ClientMessageV2' | 'ClientMessageV3'
  message: unknown
  timestamp?: number
}

function getClientMessagePrompt(data: CallActionData[]) {
  if (!Array.isArray(data)) return JSON.stringify(data)
  const firstAction = data[0]
  if (firstAction.prompt && typeof firstAction.prompt === 'string') {
    return firstAction.prompt
  } else {
    return varNameToName(firstAction.action)
  }
}

export function ClientMessageView(props: ClientMessageViewProps) {
  return (
    <div className="flex items-end justify-end mb-5">
      <div className="flex flex-col">
        <div className="flex bg-white rounded border border-[#E8EBED] h-full ">
          <div className="flex flex-col px-5 py-5 items-start justify-center">
            <div className="text-medium font-medium">
              {props.messageType === 'ClientMessageV2' &&
                (props.message as ClientMessageV2).data}
              {props.messageType === 'ClientMessageV3' &&
                ((props.message as ClientMessageV3).data.payload.prompt as string)}
              {props.messageType === 'ClientMessage' &&
                Array.isArray((props.message as ClientMessage).data) &&
                getClientMessagePrompt((props.message as ClientMessage).data)}              
            </div>
          </div>
        </div>
        <div className="flex justify-end mr-2 mt-1">
          <Timestamp timestampMillis={props.timestamp} />
        </div>
      </div>
    </div>
  )
}
