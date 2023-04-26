import { AppDto } from '@razzle/dto'
import { useNavigate, useParams } from 'react-router-dom'
import { Spinner } from '../../components/spinners'
import { APP_SELECTED } from '../../events'
import { useEventTracker } from '../../mixpanel'
import { useGetAppsInAccount, useGetPublicApps } from '../queries'
import razzle_icon_black from '../../../assets/images/razzle_icon_black.svg'
import { AppCardIcon } from './components/app-card-icon'
import { AppPrivacyBadge } from './components/app-privacy-badge'

export function AppsListPage() {
  const { accountId } = useParams()

  return (
    <div className="flex flex-col gap-3 w-full px-5 pt-5">
      <InstalledAppsPage accountId={accountId} />
      <MarketplaceAppsPage accountId={accountId} />
    </div>
  )
}

export function InstalledAppsPage(props: { accountId: string }) {
  const { accountId } = props
  const { data: apps, isLoading } = useGetAppsInAccount(accountId, {
    enabled: true,
  })
  const { trackEvent } = useEventTracker()
  const navigate = useNavigate()

  return isLoading ? (
    <div className="w-full h-full flex flex-col items-center justify-center py-5">
      <Spinner size="small" />
    </div>
  ) : (
    <div className="flex flex-col w-full px-5 pt-5">
      <p className="text-gray-600 text-sm font-semibold">
        {isLoading ? '' : `${apps?.length} Apps installed`}
      </p>
      <div className="grid grid-cols-4 gap-4 mt-4">
        {apps?.map((app) => (
          <AppCard
            key={app.id}
            app={app}
            onClick={() => {
              if (app.isDefault) {
                return
              }
              trackEvent(APP_SELECTED, { ...app })
              navigate(`/accounts/${accountId}/apps/${app.id}`)
            }}
          />
        ))}
      </div>
    </div>
  )
}

function MarketplaceAppsPage(props: { accountId: string }) {
  const { accountId } = props
  const navigate = useNavigate()
  const { data: apps, isLoading } = useGetPublicApps({
    enabled: true,
  })

  return isLoading ? (
    <div className="w-full h-full flex flex-col items-center justify-center py-5">
      <Spinner size="small" />
    </div>
  ) : (
    <div className="flex flex-col w-full px-5 pt-5">
      <p className="text-gray-600 text-sm font-semibold">
        {isLoading ? '' : `Razzle app marketplace`}
      </p>
      <div className="grid grid-cols-4 gap-4 mt-4">
        {apps?.map((app) => (
          <AppCard
            key={app.id}
            app={app}
            onClick={() => {
              if (app.isDefault) {
                return
              }
              // trackEvent(APP_SELECTED, { ...app })
              navigate(`/accounts/${accountId}/apps/${app.id}`)
            }}
          />
        ))}
      </div>
    </div>
  )
}

function AppCard({ app, onClick }: { app: AppDto; onClick?: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex flex-col border bg-white border-[#E8EBED] hover:shadow-md active:bg-gray-100 rounded cursor-pointer shadow-sm gap-3  text-gray-700 transition-shadow duration-300"
    >
      <div className="flex flex-row w-full items-start justify-start gap-3">
        {app.isDefault ? <DefaultAppIcon /> : <AppCardIcon app={app} />}

        <div className="flex flex-col py-2 items-start justify-start">
          <div className="flex flex-row items-center justify-start gap-3">
            <p className="text-base font-semibold">{app.name}</p>
            <AppPrivacyBadge isPublic={app.isPublic} />
          </div>

          <p className="text-xs">{`@${app.handle}`}</p>
        </div>
      </div>
    </div>
  )
}

function DefaultAppIcon() {
  return (
    <div className="w-20 h-20 rounded-l bg-lavenderBlue flex flex-col items-center justify-center">
      <img
        className="mx-auto w-10 h-10"
        src={razzle_icon_black}
        alt=""
        referrerPolicy="no-referrer"
      />
    </div>
  )
}


