/* eslint-disable jsx-a11y/anchor-is-valid */
import { BiArrowBack } from 'react-icons/bi'
import {
  Outlet,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from 'react-router-dom'
import { PrimaryOutlineButton } from '../../components/buttons'
import { CREATE_APP_LINK_CLICKED } from '../../events'
import { useEventTracker } from '../../mixpanel'
import { TitleBar } from '../layout/title-bar'
import AppDetailPage from './app-detail.page'
import CreateAppPage from './create-app.page'
import { AppsListPage } from './apps.list.page'

export default function AppsLayout() {
  return (
    <div className="flex flex-col w-full h-full bg-gray-50">
      <TitleBar>
        <AppsPageTitleBar />
      </TitleBar>
      <Routes>
        <Route path="*" element={<AppsListPage />} />
        <Route path=":appId" element={<AppDetailPage />} />
        <Route path="create" element={<CreateAppPage />} />
      </Routes>
    </div>
  )
}

function AppsPageTitleBar() {
  const { accountId } = useParams()
  const navigate = useNavigate()
  const { trackEvent } = useEventTracker()
  const location = useLocation()
  const appsPagePath = `/accounts/${accountId}/apps`
  const isOnAppsPage = location.pathname === appsPagePath
  const isOnCreateAppPage = location.pathname === `/accounts/${accountId}/apps/create`

  return (
    <div className="flex flex-row justify-between w-full">
      {!isOnAppsPage && (
        <button
          onClick={() => navigate(appsPagePath)}
          className="flex flex-row gap-2 text-base items-center font-medium text-gray-700 hover:text-electricIndigo-500 transition-colors duration-300"
        >
          <BiArrowBack size={22} className="" />
          Back to apps
        </button>
      )}
      {!isOnCreateAppPage && (
        <PrimaryOutlineButton
          text="Create new app"
          onClick={() => {
            trackEvent(CREATE_APP_LINK_CLICKED)
            navigate(`/accounts/${accountId}/apps/create`)
          }}
        />
      )}
    </div>
  )
}
