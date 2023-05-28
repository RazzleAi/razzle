import { Combobox } from '@headlessui/react'
import { Fragment, useState, useEffect, useRef } from 'react'
import { MdOutlineAlternateEmail, MdOutlineAttachFile } from 'react-icons/md'
import { PROMPT_ENTERED } from '../../../events'
import { useHotKeys } from '../../../hooks'
import { useEventTracker } from '../../../mixpanel'
import { useWSClientStore } from '../../../stores/ws-client-store'
import { useFirebaseServices } from '../../../firebase'
import { useAppStore } from '../../../stores/app-store'
import { ClientHistoryItemDto, ServerToClientMessage } from '@razzle/dto'
import { ConsoleLogger } from '@nestjs/common'
import Log from '../../../utils/logger'
import { ClientMessageV3 } from '@razzle/dto'

export default function PromptField() {
  const [query, setQuery] = useState('')
  const [prompt, setPrompt] = useState<any>(null)
  const { trackEvent } = useEventTracker()
  const { sendMessage, setOnMessageReceived } = useWSClientStore()
  const { currentUser } = useFirebaseServices()
  const { account, currentWorkspace } = useAppStore()
  const intervalIdRef = useRef(null)

  const [placeholder, setPlaceholder] = useState('What would you like to do?');


  const handlePromptChange = (value: any) => {
    if (value === '') {
      setPrompt(query)
    }

    setQuery(value)
  }


  useEffect(() => {

    const onMessageReceived = (message: any) => {
      const response = JSON.parse(message) as ServerToClientMessage<unknown>
      Log.info("Message Received: " + JSON.stringify(response))
      switch (response.event) {
        case 'History': {
          Log.info("On Message Received Timer: " + intervalIdRef.current)
          const historyItems = response.data as ClientHistoryItemDto[]
          if (!historyItems.length) {
            Log.info("No history items")
            return;
          }

          const lastMessage = historyItems[historyItems.length - 1]
          // lastMessage is a ClientMessageV3 and has a payload.prompt
          if (!(lastMessage.message as ClientMessageV3)) {
            Log.info("No Client message V3")
            return
          }

          if (typeof (lastMessage.message as ClientMessageV3).data.payload.prompt === "string") {
            Log.info("No prompt in Client message V3")
            return;
          }
          
          if (intervalIdRef.current) {
            clearInterval(intervalIdRef.current);
            setPlaceholder('What would you like to do?')
            intervalIdRef.current = null;
          }

          break
        }
      }
    }


    const handle = setOnMessageReceived(onMessageReceived)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendPrompt = async (value: string) => {
    if (!currentWorkspace || !account) {
      Log.error('No workspace or account')
      return
    }
    const accessToken = await currentUser?.getIdToken()
    sendMessage(accessToken, {
      event: 'Message',
      data: {
        workspaceId: currentWorkspace.id,
        accountId: account.id,
        payload: { prompt: value },
      },
    })
  }

  useHotKeys({
    key: 'Escape',
    componentName: 'PromptField',
    includeMetaKey: false,
    callback: () => {
      // TODO
    },
  })

  return (
    <Combobox as={Fragment}>
      <div className="flex flex-col w-full rounded bg-white border-[#E8EBED] border shadow-slate-500/10 shadow-xs shadow px-5 py-5">
        <Combobox.Input
          as="textarea"
          rows={1}
          className="flex flex-grow w-full font-medium text-[#848484] text-sm border-none resize-none active:outline-none focus:outline-none focus:ring-0"
          onChange={(event) => handlePromptChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              const target = event.target as HTMLTextAreaElement
              if (target.value.length === 0) {
                return
              }
              trackEvent(PROMPT_ENTERED, { prompt: target.value })
              sendPrompt(target.value)

              let dotCount = 0
              intervalIdRef.current = setInterval(() => {
                setPlaceholder('Working' + '.'.repeat(++dotCount % 5))
              }, 400)
              console.log("Setting Timer: " + intervalIdRef.current)
            }
          }}
          placeholder={placeholder}
        />
      </div>
    </Combobox>
  )
}
