/* eslint-disable jsx-a11y/anchor-is-valid */
import {
  AuthenticationMessage,
  OnboardingDto,
  ServerToClientMessage,
} from '@razzle/dto'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useOnboardingStore } from '../../../stores/onboarding.store'
import { useWSClientStore } from '../../../stores/ws-client-store'
import { useFetchOnboardingStatus } from '../../queries'
import { HistoryItemView } from './history-item-view'
import { OnboardingView } from './onboarding-view'
import { ChatHistoryItem } from '@razzle/services'

export function MessagePane() {
  const [messages, setMessages] = useState<ChatHistoryItem[]>([])
  const { setOnMessageReceived, removeOnMessageReceived } = useWSClientStore()

  const { accountId } = useParams()
  const { onboarding } = useOnboardingStore()
  const onboardingComplete =
    onboarding &&
    onboarding.appCreated &&
    onboarding.appSynced &&
    onboarding.firstActionTriggered
  useFetchOnboardingStatus(accountId, {
    refetchInterval: onboardingComplete ? false : 5000,
    refetchOnWindowFocus: false,
  })

  const scrollHandle = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handle = setOnMessageReceived(onMessageReceived)
    return () => removeOnMessageReceived(handle)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setTimeout(() => {
      scrollToBottom()
    }, 500)
  }, [messages])

  const onMessageReceived = (message: any) => {
    const response = JSON.parse(message) as ServerToClientMessage<unknown>
    switch (response.event) {
      case 'History': {
        const historyItems = response.data as ChatHistoryItem[]
        setMessages(historyItems)
        break
      }
      case 'AuthenticationResponse': {
        const authResponse: AuthenticationMessage =
          response.data as AuthenticationMessage
        window.open(authResponse.url, '_blank')
      }
    }
  }

  const scrollToBottom = () => {
    if (scrollHandle.current) {
      scrollHandle.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {(messages?.length || 0) === 0 &&
      onboarding &&
      !isOnboardingComplete(onboarding) ? (
        <OnboardingView />
      ) : undefined}
      <div className="flex flex-col w-full pt-6 px-4">
        <MessagesView messages={messages} />
        <div className="float-left clear-both" ref={scrollHandle}></div>
      </div>
    </>
  )
}

function isOnboardingComplete(onboarding: OnboardingDto) {
  return (
    onboarding.appCreated &&
    onboarding.appSynced &&
    onboarding.firstActionTriggered
  )
}

function MessagesView(props: { messages: ChatHistoryItem[] }) {
  return (
    <>
      {props.messages.map((message, idx) => {
        return <HistoryItemView key={`${idx}.${message.id}`} item={message} />
      })}
    </>
  )
}
