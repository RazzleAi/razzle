import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useFirebaseServices } from '../../firebase'
import { CenterPane } from './center-pane'
import { useAppStore } from '../../stores/app-store'
import { useWSClientStore } from '../../stores/ws-client-store'
import { Spinner } from '../../components/spinners'
import { useFetchAppCtxData } from '../queries'

export function WorkspacePage() {
  const [isConnected, setIsConnected] = useState(true)
  const { currentUser } = useFirebaseServices()
  const { accountId } = useParams()
  const {
    account,
    me,
    setMe,
    setAccount,
  } = useAppStore()

  const {
    refetch: fetchAppCtxData,
    isLoading,
    data: appCtxData,
  } = useFetchAppCtxData(accountId)

  const {
    identify,
    setOnConnected,
    removeOnConnected,
    setOnDisconnected,
    removeOnDisconnected,
  } = useWSClientStore()

  useEffect(() => {
    if (currentUser) {
      fetchAppCtxData()
    }
  }, [currentUser, fetchAppCtxData])

  useEffect(() => {
    console.debug('AppCtxData', appCtxData)
    if (!appCtxData) return

    setMe(appCtxData.me || me)
    setAccount(appCtxData.account || account)    
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appCtxData])

  useEffect(() => {
    if (!currentUser || !account) return
    currentUser.getIdToken().then((accessToken) => {
      console.debug(
        'Identifying user with WS server',
        accessToken,
        currentUser.uid,
        account?.id
      )
      identify(accessToken, account?.id)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, isConnected])

  useEffect(() => {
    const connHandle = setOnConnected(() => {
      setIsConnected(true)
    })

    const disconnHandle = setOnDisconnected(() => {
      setIsConnected(false)
    })

    return () => {
      removeOnConnected(connHandle)
      removeOnDisconnected(disconnHandle)
    }
  }, [])

  if (isLoading) {
    return (
      <div className="flex flex-col w-full h-full items-center justify-center bg-white">
        <Spinner size="medium" thumbColorClass="fill-electricIndigo-500" />
      </div>
    )
  }

  return <CenterPane />
}
