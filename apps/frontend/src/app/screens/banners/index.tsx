import { XMarkIcon } from '@heroicons/react/24/outline'
import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useEventTracker } from '../../mixpanel'
import { useAppStore } from '../../stores/app-store'
import { useGetAppsInAccount } from '../queries'

export function Banners() {
  return <></>
  // return <CreateFirstAppBanner />
}

function CreateFirstAppBanner() {
  const [show, setShow] = useState(false)
  const { account } = useAppStore()
  const {
    isLoading,
    data: appsInAccount,
    error,
    refetch: getAppsInAccount,
  } = useGetAppsInAccount(account?.id || '', {
    enabled: false,
  })
  const navigate = useNavigate()
  const location = useLocation()
  const { trackEvent } = useEventTracker()

  useEffect(() => {
    if (account) {
      getAppsInAccount()
    }
  }, [account, getAppsInAccount])

  useEffect(() => {
    if (isLoading || appsInAccount === undefined || appsInAccount === null) {
      return
    }

    const nonDefaultApps = appsInAccount?.filter((app) => !app.isDefault)
    console.debug('nonDefaultApps', nonDefaultApps)
    setShow((nonDefaultApps?.length || 0) === 0)
  }, [appsInAccount, isLoading])

  useEffect(() => {
    if (location.pathname.endsWith('apps/create')) {
      setShow(false)
    }
  }, [location])

  function handleClick(e: React.MouseEvent<HTMLAnchorElement, MouseEvent>) {
    e.preventDefault()
    // trackEvent(CREATE_FIRST_APP_BANNER_CLICKED)
    setShow(false)
    navigate('apps/create')
  }

  return show ? (
    <div className="pointer-events-none transition-transform duration-[2000ms]">
      <div className="pointer-events-auto flex flex-row items-center gap-x-6 bg-gray-900 py-2.5 px-6 sm:py-3 sm:pr-3.5 sm:pl-4">
        <div className="flex flex-grow"></div>
        <p className="text-sm leading-6 text-white">
          <a href="/" onClick={(e) => handleClick(e)}>
            <strong className="font-semibold">Create your first app</strong>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 2 2"
              className="mx-2 inline h-0.5 w-0.5 fill-current"
              aria-hidden="true"
            >
              <circle cx={1} cy={1} r={1} />
            </svg>
            Get started with Razzle by creating your first app&nbsp;
            <span aria-hidden="true">&rarr;</span>
          </a>
        </p>
        <div className="flex flex-grow"></div>
        <button
          type="button"
          className="-m-3 flex-none p-3 focus-visible:outline-offset-[-4px]"
        >
          <span className="sr-only">Dismiss</span>
          <XMarkIcon
            className="h-5 w-5 text-white"
            aria-hidden="true"
            onClick={() => {
              setShow(false)
            }}
          />
        </button>
      </div>
    </div>
  ) : undefined
}
