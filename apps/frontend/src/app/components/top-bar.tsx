import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import { useFirebaseServices } from '../firebase'
import logo_black from '../../assets/images/razzle_logo_black.svg'
import { useAppStore } from '../stores/app-store'
import { useEventTracker } from '../mixpanel'
import { LOGOUT_CLICKED, WORKSPACE_MENU_CLICKED } from '../events'
import { AiOutlineAppstore } from 'react-icons/ai'
import { MdOutlineWorkspaces } from 'react-icons/md'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useGetAccountMembers } from '../screens/queries/account'

export function TopBar() {
  const { account } = useAppStore()
  const { auth } = useFirebaseServices()
  const { signout } = useAppStore()
  const { trackEvent } = useEventTracker()
  const { clearAccount } = useAppStore()

  function signoutClicked() {
    trackEvent(LOGOUT_CLICKED)
    clearAccount()
    auth.signOut()
    signout()
  }

  return (
    <div
      className={
        'flex flex-row h-[80px] px-8 w-full bg-white items-center content-end border-b border-b-[#E8EBED] '
      }
    >
      <div className="flex flex-row justify-between items-center h-full grow">
        <img
          alt="Logo"
          src={logo_black}
          referrerPolicy="no-referrer"
          className="w-20 h-20"
        />
        {account && <TopLinks />}

        <div className="flex flex-row items-center justify-center gap-5">
          <div className="flex flex-row items-center space-x-2">
            {account ? (
              <RightPopup />
            ) : (
              <button
                className="text-electricIndigo-500"
                onClick={signoutClicked}
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function TopLinks() {
  const { trackEvent } = useEventTracker()
  const location = useLocation()
  const navigate = useNavigate()
  const { accountId } = useParams()
  const isOnWorkspacePage = location.pathname.endsWith(accountId)

  return (
    <div className="flex flex-row gap-2">
      <a
        href={`/accounts/${accountId}/apps`}
        onClick={(e) => {
          e.preventDefault()
          trackEvent(WORKSPACE_MENU_CLICKED)
          navigate(`/accounts/${accountId}/apps`)
        }}
        className={
          'flex flex-row gap-2 items-center justify-center w-[150px] px-3 py-3 rounded hover:text-white hover:bg-electricIndigo-600 transition-colors duration-300 ' +
          (!isOnWorkspacePage ? 'bg-electricIndigo-500 text-white' : '')
        }
      >
        <AiOutlineAppstore size={20} className="" />
        Apps
      </a>
      <a
        href={`/${accountId}`}
        onClick={(e) => {
          e.preventDefault()
          trackEvent(WORKSPACE_MENU_CLICKED)
          navigate(`/accounts/${accountId}`)
        }}
        className={
          'flex flex-row gap-2 items-center justify-center w-[150px] px-3 py-3 rounded hover:text-white hover:bg-electricIndigo-600 transition-colors duration-300 ' +
          (isOnWorkspacePage ? 'bg-electricIndigo-500 text-white' : '')
        }
      >
        <MdOutlineWorkspaces size={20} className="" />
        Workspace
      </a>
    </div>
  )
}

export function RightPopup() {
  const navigate = useNavigate()
  const { auth, currentUser } = useFirebaseServices()
  const { signout, me } = useAppStore()
  const { trackEvent } = useEventTracker()
  const { account } = useAppStore()
  const { clearAccount } = useAppStore()

  function signoutClicked() {
    trackEvent(LOGOUT_CLICKED)
    auth.signOut()
    signout()
  }

  return (
    <Menu as="div">
      <div className="flex flex-row items-center justify-center">
        <Menu.Button as="div">
          <div className="flex flex-row items-center gap-1 cursor-pointer">
            {account && <AccountMembersButton />}
          </div>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-3 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 divide-y divide-gray-40000 focus:outline-none">
          <div className="py-1">
            <Menu.Item>
              <button className="w-full">
                <div className="flex flex-col items-start bg-white space-y-[5px] text-gray-900 hover:bg-gray-100 hover:text-gray-900 px-4 py-2 text-sm">
                  <span className="font-bold text-sm">
                    {currentUser?.displayName ?? 'Anonymous'}
                  </span>

                  <span className="font-medium text-xs">
                    {currentUser?.email ?? ''}
                  </span>
                  <span className="font-medium text-xs">
                    @{me?.user?.username ?? ''}
                  </span>
                </div>
              </button>
            </Menu.Item>
          </div>

          <div className="py-1">
            <Menu.Item>
              <a
                href="/accounts"
                className="w-full"
                onClick={(e) => {
                  e.preventDefault()

                  clearAccount()                  
                  navigate('/accounts')
                }}
              >
                <div className="flex flex-col w-full items-start bg-white space-y-[5px] text-gray-900 hover:bg-gray-100 hover:text-gray-900 px-4 py-2 text-sm">
                  <span className="font-medium text-sm">Switch account</span>
                </div>
              </a>
            </Menu.Item>
          </div>
          {account &&
            currentUser &&
            account.owner &&
            account.owner.authUid === currentUser.uid && (
              <div className="py-1">
                <Menu.Item>
                  <button
                    onClick={(e) => {
                      // TODO
                    }}
                    className="w-full"
                  >
                    <div className="flex flex-col w-full items-start bg-white space-y-[5px] text-gray-900 hover:bg-gray-100 hover:text-gray-900 px-4 py-2 text-sm">
                      <span className="font-medium text-sm">Invite users</span>
                    </div>
                  </button>
                </Menu.Item>
              </div>
            )}
          <div className="py-1">
            <Menu.Item>
              <button onClick={signoutClicked} className="w-full">
                <div className="flex flex-col w-full items-start bg-white space-y-[5px] text-gray-900 hover:bg-gray-100 hover:text-gray-900 px-4 py-2 text-sm">
                  <span className="font-medium text-sm">Logout</span>
                </div>
              </button>
            </Menu.Item>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  )
}

function AccountMembersButton() {
  const { account } = useAppStore()

  return (
    <button className="flex flex-row p-1 rounded border border-electricIndigo-200 bg-electricIndigo-100 hover:bg-electricIndigo-200 active:bg-electricIndigo-200 transition-colors duration-200 gap-1 items-center justify-center">
      <MemberAvatars accountId={account.id} />
      {account && (
        <span className="text-gray-900 px-1 flex items-center justify-center font-semibold text-sm">
          {account.name}
        </span>
      )}
    </button>
  )
}

function MemberAvatars(props: { accountId: string }) {
  const { data, error, isLoading } = useGetAccountMembers(props.accountId ?? '')

  return data ? (
    <div className="flex flex-row overflow-clip rounded-md">
      {data.items
        .map((i) => i.user)
        .slice(0, 4)
        .map((d, index) => {
          const isFirst = index === 0
          if (!d.profilePictureUrl) {
            return (
              <div
                key={d.id}
                className={`flex w-9 h-9 rounded-[50%] border-white border-2 items-center justify-center text-white text-sm uppercase bg-slate-700 ${
                  !isFirst ? '-ml-2' : ''
                }`}
              >
                {d.username?.[0] ?? 'A'}
              </div>
            )
          }

          return (
            <img
              key={d.id}
              src={d.profilePictureUrl}
              className={`flex w-9 h-9 border-2 border-white rounded-[50%] ${
                !isFirst ? '-ml-2' : ''
              }`}
              alt={`avatar of ${d.username}`}
            />
          )
        })}
    </div>
  ) : undefined
}
