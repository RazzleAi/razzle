import { Route, Routes, useLocation } from 'react-router-dom'
import { TopBar } from '../../components/top-bar'
import { useAppStore } from '../../stores/app-store'
import AppsLayout from '../apps/apps.page'
import { Banners } from '../banners'
import { WorkspacePage } from '../workspaces'
import { LeftPaneButtonBar } from './left-pane-button-bar'

export function MainLayout() {
  const location = useLocation()
  const { account } = useAppStore()
  const isOnWorkspacePage = location.pathname.endsWith(`${account?.id}`)
  console.debug('isOnWorkspacePage', { isOnWorkspacePage, location, account })

  return (
    <div className="flex flex-col items-center bg-white w-full h-screen">
      <div className="flex w-full">
        <TopBar />
      </div>
      <div className="flex flex-col w-full">
        <Banners />
      </div>
      <div className="flex flex-row w-full flex-grow">
        <div className="flex flex-row">
          <LeftPaneButtonBar />
          {/* TODO: add a list of apps on the right */}
          {/* {isOnWorkspacePage && <LeftPaneNavbar />} */}
        </div>
        <div className="flex flex-col flex-grow">
          <Routes>
            <Route path="/*" element={<WorkspacePage />} />
            <Route path="/apps/*" element={<AppsLayout />} />
          </Routes>
        </div>
      </div>
    </div>
  )
}
