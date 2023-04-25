import { Combobox } from '@headlessui/react'
import { Fragment, useState } from 'react'
import { MdOutlineAlternateEmail, MdOutlineAttachFile } from 'react-icons/md'
import { PROMPT_ENTERED } from '../../../events'
import { useHotKeys } from '../../../hooks'
import { useEventTracker } from '../../../mixpanel'
import { useWSClientStore } from '../../../stores/ws-client-store'
import { useFirebaseServices } from '../../../firebase'
import { useAppStore } from '../../../stores/app-store'

export default function PromptField() {
  const [query, setQuery] = useState('')
  const [prompt, setPrompt] = useState<any>(null)  
  const { trackEvent } = useEventTracker()
  const { sendMessage } = useWSClientStore()
  const { currentUser } = useFirebaseServices()
  const { account, currentWorkspace } = useAppStore()

  const handlePromptChange = (value: any) => {
    if (value === '') {
      setPrompt(query)
    }

    setQuery(value)
  }

  const sendPrompt = async (value: string) => {
    if (!currentWorkspace || !account) {
      console.error('No workspace or account')
      return
    }
    const accessToken = await currentUser?.getIdToken()
    sendMessage(accessToken, {
      event: 'Message',
      data: {
        workspaceId: currentWorkspace.id,
        accountId: account.id,
        payload: {prompt: value},
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
            }
          }}
          placeholder="What would you like to do?"
        />
      </div>
    </Combobox>
  )
}
