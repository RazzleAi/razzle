// eslint-disable-next-line @typescript-eslint/no-unused-vars

import { Route, Routes, useLocation, useNavigate } from 'react-router-dom'
import { useFirebaseServices } from './firebase'
import { onAuthStateChanged } from '@firebase/auth'
import { QueryClient, QueryClientProvider } from 'react-query'
import { ReactQueryDevtools } from 'react-query/devtools'
import { useEffect } from 'react'
import { LoginPage, AccountUserInvitePage, WorkspacePage } from './screens'
import { AccountsLayout } from './screens/teams/create-select-account.page'
import CreateAppPage from './screens/apps/create-app.page'
import { MainLayout } from './screens/layout/main-layout'
import AppsLayout from './screens/apps/apps.page'
import AppDetailPage from './screens/apps/app-detail.page'
import { useEventTracker } from './mixpanel'
import { useUiStore } from './stores/ui-store'
import { AiOutlineClose } from 'react-icons/ai'
import { AccountListPage } from './screens/teams/account-list.page'
import { CreateAccountPage } from './screens/teams/create-account.page'
import { CheckAuthStatePage } from './screens/auth/check-auth-state.page'

const queryClient = new QueryClient()

// const authLocations = ['/login', '/signup', '/account/invite']

const authIgnoreLocations = ['/account/invite']

export function App() {
  const { auth, setCurrentUser } = useFirebaseServices()
  const navigate = useNavigate()
  const location = useLocation()
  const { identify } = useEventTracker()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currUser) => {
      setCurrentUser(currUser)

      if (!currUser) {
        // setCurrentUser(undefined)
        if (authIgnoreLocations.includes(location.pathname)) {
          navigate(location)
        } else {
          navigate('/login')
        }
      } else {
        identify(currUser.uid, currUser.email)
      }
    })
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const { showToast, clearToast, toastMessage } = useUiStore()

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Routes>
          <Route path="/" element={<CheckAuthStatePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/account/invite" element={<AccountUserInvitePage />} />
          <Route path="/accounts" element={<AccountsLayout />} />
          <Route path="/accounts/create" element={<CreateAccountPage />} />
          <Route path="/accounts/:accountId/*" element={<MainLayout />} />
        </Routes>

        <ReactQueryDevtools initialIsOpen position="bottom-right" />
      </QueryClientProvider>
      {showToast ? (
        <div className="absolute bottom-4 left-1/2 z-20 bg-gray-700 rounded-lg p-4 shadow duration-300">
          {/* <div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-500 text-white dark:bg-blue-800 dark:text-blue-200">
            <AiFillCopy className="h-5 w-5" />
          </div> */}
          <div className="flex flex-row items-center justify-between gap-3">
            <div className=" text-sm font-normal text-white">
              {toastMessage}
            </div>
            <button
              type="button"
              className="flex bg-transparent rounded-md p-1 hover:ring-1 focus:ring-1 ring-gray-300"
              onClick={(e) => {
                clearToast()
              }}
            >
              <AiOutlineClose size={16} className="text-gray-50" />
            </button>
          </div>
        </div>
      ) : undefined}
    </>
  )
}

export default App
