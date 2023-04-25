/* eslint-disable jsx-a11y/anchor-is-valid */

import { AiFillCheckCircle } from 'react-icons/ai'
import { useGetAppById } from '../workspaces/center-pane/queries'
import { useNavigate, useParams } from 'react-router-dom'
import { Spinner } from '../../components/spinners'
import { AppDto } from '@razzle/dto'
import {
  useDeleteApp,
  useGenerateNewAPIKey,
  useGetAppSyncStatus,
  useUpdateApp,
} from '../queries'
import { useEffect, useState } from 'react'
import { WarningDisplay } from '../../components/warning-display'
import CopyBytton from '../../components/copy-button'
import { useEventTracker } from '../../mixpanel'
import {
  COPY_API_KEY_CLICKED,
  COPY_APP_ID_CLICKED,
  DELETE_APP_CLICKED,
  GENERATE_API_KEY_CLICKED,
} from '../../events'
import { useAppPagesStore } from './apps-store'
import razzle_icon_black from '../../../assets/images/razzle_icon_black.svg'
import ConfirmDeleteModal from './confirm-delete-modal'
import { MdOutlineModeEditOutline } from 'react-icons/md'
import { PrimaryButton, PrimaryOutlineButton } from '../../components/buttons'
import { useForm } from 'react-hook-form'

export default function AppDetailPage() {
  const { appId } = useParams()
  const { data: app, isLoading } = useGetAppById(appId)
  return isLoading ? (
    <div className="w-full h-full flex flex-row items-center justify-center">
      <Spinner size="medium" thumbColorClass="fill-electricIndigo-500" />
    </div>
  ) : (
    <div className="flex flex-col w-full h-full bg-gray-50 px-10 py-10">
      <AppDetailsHeader app={app} isLoading={isLoading} />
      <AppSyncStatus app={app} />
      <AppCredentials app={app} />
      <DeleteApp app={app} />
    </div>
  )
}

function AppDetailsHeader(props: { isLoading: boolean; app?: AppDto }) {
  const { isLoading } = props
  const [isEditing, setIsEditing] = useState(false)
  const [app, setApp] = useState<AppDto>(props.app)

  return isLoading ? (
    <div className="h-[104px] overflow-hidden rounded-lg bg-white shadow flex flex-col items-center justify-center">
      <Spinner size="medium" thumbColorClass="fill-electricIndigo-500" />
    </div>
  ) : (
    <div className="overflow-hidden rounded-lg bg-white shadow">
      <h2 className="sr-only" id="profile-overview-title">
        App details
      </h2>
      <div className="bg-white p-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="sm:flex sm:space-x-5">
            <div className="flex-shrink-0 h-16 w-16 flex flex-row justify-center p-4 items-center rounded-full bg-lavenderBlue">
              <img
                className="mx-auto w-full h-full"
                src={razzle_icon_black}
                alt=""
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="group flex flex-row  mt-4 text-center sm:mt-0 sm:pt-1 sm:text-left">
              <div className="h-full flex flex-col items-start">
                {!isEditing ? (
                  <>
                    <p className="text-xl font-bold text-gray-900 sm:text-2xl">
                      {app?.name ?? ''}
                    </p>
                    <p className="text-sm font-medium text-gray-600">
                      @{app?.handle ?? ''}
                    </p>
                    <p className="text-sm mt-2 font-medium text-gray-600">
                      {app?.description ?? ''}
                    </p>
                  </>
                ) : (
                  <EditAppForm
                    app={app}
                    cancelClicked={() => setIsEditing(false)}
                    onComplete={(app) => {
                      setIsEditing(false)
                      setApp(app)
                    }}
                  />
                )}
              </div>
              {isEditing ? undefined : (
                <div className="flex flex-col opacity-0 items-center h-full group-hover:opacity-100 transition-opacity duration-300 ml-3">
                  <button
                    type="button"
                    className="h-full flex mt-3"
                    onClick={(e) => {
                      setIsEditing(true)
                    }}
                  >
                    <MdOutlineModeEditOutline size={22} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EditAppForm({
  app,
  cancelClicked,
  onComplete,
}: {
  app?: AppDto
  cancelClicked: () => void
  onComplete?: (app: AppDto) => void
}) {
  const {
    register,
    handleSubmit,
    formState: { isDirty, isValid },
  } = useForm({
    defaultValues: {
      appName: app?.name ?? '',
      description: app?.description ?? '',
    },
  })

  const { isLoading, mutate } = useUpdateApp({ onSuccess: onAppUpdated })

  function onSubmit(data: { appName: string; description: string }) {
    mutate({
      id: app?.id,
      data: {
        name: data.appName,
        description: data.description,
      },
    })
  }

  function onAppUpdated(app: AppDto) {
    onComplete?.(app)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div className="border-b mb-2 border-gray-700 bg-gray-50 rounded-sm">
        <input
          type="text"
          {...register('appName', { required: true })}
          placeholder="Edit app name"
          className="p-1 border-none ring-0 bg-transparent focus:outline-none focus:ring-0 text-sm "
        />
      </div>
      <div className="border-b border-gray-700 bg-gray-50 rounded-sm">
        <textarea
          {...register('description', { required: false })}
          rows={2}
          placeholder="Edit app description"
          className="p-1 border-none bg-transparent ring-0 focus:outline-none focus:ring-0 text-sm "
        />
      </div>
      <div className="mt-2 space-x-2">
        <PrimaryButton
          disabled={isDirty && !isValid}
          isLoading={isLoading}
          text="Save"
          short={true}
          type="submit"
        />
        <PrimaryOutlineButton
          text="Cancel"
          short={true}
          onClick={cancelClicked}
        />
      </div>
    </form>
  )
}

function AppCredentials({ app }: { app?: AppDto }) {
  const [showCopiedToast, setShowCopiedToast] = useState(false)
  const {
    isLoading: isGenerating,
    isError,
    mutate,
  } = useGenerateNewAPIKey({
    onSuccess: onAPIKeyGenerated,
  })

  const [apiKey, setApiKey] = useState(undefined)
  const { trackEvent } = useEventTracker()
  const { createAppResponse } = useAppPagesStore()
  const appApiKey = createAppResponse?.apiKey ?? apiKey

  useEffect(() => {
    if (showCopiedToast === true) {
      const timer = setTimeout(() => {
        setShowCopiedToast(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [showCopiedToast, setShowCopiedToast])

  function generateApiKeyClicked() {
    if (!app) return

    trackEvent(GENERATE_API_KEY_CLICKED, { ...app })
    mutate(app.id)
  }

  function onAPIKeyGenerated(apiKey: string) {
    setApiKey(apiKey)
  }

  return (
    <div className="mt-5 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Integration
        </h3>
        <div className="mt-2 text-sm text-gray-500">
          <p>Connect your razzle app using the following credentials</p>
        </div>
        <div className="flex flex-col gap-1 mt-3">
          <div>
            <label className="font-semibold text-gray-600 mb-1 text-sm">
              App ID
            </label>
            <div className="flex flex-row gap-2 items-center">
              <div className="px-1 py-2 bg-gray-200 border border-gray-400 shadow-inner overflow-auto min-w-[200px] min-h-[42px] rounded-sm">
                {app?.appId ?? ''}
              </div>
              <CopyBytton
                text={app?.appId}
                tooltip="Copy app ID"
                onClick={() => {
                  trackEvent(COPY_APP_ID_CLICKED, { ...app })
                }}
              />
            </div>
          </div>
          <div className="mt-2">
            <label className="font-semibold text-gray-600 mb-1 text-sm">
              API Key
            </label>
            <div className="flex flex-row gap-2 items-center">
              {appApiKey ? (
                <div className="gap-2">
                  <WarningDisplay
                    title=""
                    message="Make sure to copy your new API key now. You won’t be able to see it again."
                    show={true}
                  />
                  <div className="flex flex-row gap-2 items-center">
                    <div className="px-1 py-2 bg-gray-200 border border-gray-400 shadow-inner overflow-auto rounded-sm">
                      {appApiKey}
                    </div>
                    <CopyBytton
                      onClick={() => {
                        trackEvent(COPY_API_KEY_CLICKED, { ...app })
                      }}
                      text={appApiKey}
                      tooltip="Copy API key"
                    />
                  </div>
                </div>
              ) : (
                <PrimaryButton
                  text="Generate new API Key"
                  onClick={generateApiKeyClicked}
                  isLoading={isGenerating}
                  type="button"
                />
              )}
            </div>
          </div>
        </div>
        <div className="mt-3 text-sm">
          <a
            href="https://github.com/RazzleAi/docs/blob/master/quick-start.md"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-electricIndigo-500 hover:text-electricIndigo-600"
          >
            Learn more about how to connect your app
            <span aria-hidden="true"> &rarr;</span>
          </a>
        </div>
      </div>
    </div>
  )
}

function AppSyncStatus({ app }: { app?: AppDto }) {
  const [checkForSyncStatus, setCheckForSyncStatus] = useState(true)

  const { data: appSyncStatus, isLoading } = useGetAppSyncStatus(app.id, {
    enabled: checkForSyncStatus,
    refetchInterval: 4000,
  })

  useEffect(() => {
    if (appSyncStatus?.isSynced) {
      setCheckForSyncStatus(false)
    }
  }, [appSyncStatus])

  return isLoading ? undefined : (
    <div className="mt-5 bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Status</h3>

        <div className="flex flex-col gap-1 mt-3">
          <div className="flex flex-row w-full justify-start">
            <div className="flex flex-col gap-1 items-center justify-center">
              {appSyncStatus.isSynced ? (
                <>
                  <AiFillCheckCircle size={20} className="text-green-700" />
                  <span className="text-xs text-gray-500">Synced</span>
                </>
              ) : (
                <>
                  <Spinner
                    size="small"
                    thumbColorClass="fill-electricIndigo-500"
                  />
                  <span className="text-xs text-gray-500">Syncing</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function DeleteApp({ app }: { app?: AppDto }) {
  const { accountId } = useParams()
  const { trackEvent } = useEventTracker()
  const navigate = useNavigate()
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
  const { mutateAsync: deleteApp } = useDeleteApp()

  function deleteAppClicked(e: React.MouseEvent<HTMLButtonElement>) {
    setConfirmDeleteOpen(true)
    trackEvent(DELETE_APP_CLICKED, { ...app })
  }

  return (
    <>
      {confirmDeleteOpen && (
        <ConfirmDeleteModal
          app={app}
          open={confirmDeleteOpen}
          setOpen={setConfirmDeleteOpen}
          deleteClicked={async () => {
            await deleteApp(app.id)
            navigate(`/accounts/${accountId}/apps`)
          }}
        />
      )}
      <button
        className="mt-5 bg-white shadow sm:rounded-lg"
        onClick={deleteAppClicked}
      >
        <div className="px-4 py-5 sm:p-6 font-semibold text-red-700">
          Delete {app.name}
        </div>
      </button>
    </>
  )
}
