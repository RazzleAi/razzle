import { CreateAppDto, CreateAppResponseDto } from '@razzle/dto'
import { useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { ErrorDisplay } from '../../components/error-display'
import { SuccessDisplay } from '../../components/success-display'
import { CREATE_APP_SUCCESS } from '../../events'
import { useEventTracker } from '../../mixpanel'
import { useAppStore } from '../../stores/app-store'
import { useCreateApp } from '../queries'
import { useAppPagesStore } from './apps-store'
import { PrimaryButton, PrimaryOutlineButton } from '../../components/buttons'
import { useState } from 'react'
import { PrimarySwitch } from '../../components/switches'

export default function CreateAppPage() {
  const { accountId } = useParams()
  const { setCreateAppResponse } = useAppPagesStore()
  const { trackEvent } = useEventTracker()
  const navigate = useNavigate()

  return (
    <div className="flex flex-col w-full h-full items-center justify-center">
      <div className="flex flex-col w-3/5 h-full bg-gray-50 py-10">
        <div className="flex flex-col gap-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Create an app
          </h3>
          <p className="text-sm text-gray-600">Create a new Razzle app</p>
        </div>

        <div className="grid grid-cols-1 gap-5 mt-5">
          <div className=" shadow h-fit sm:overflow-hidden sm:rounded-md">
            <CreateAppForm
              onAppCreated={(app: CreateAppResponseDto) => {
                trackEvent(CREATE_APP_SUCCESS, {
                  id: app.id,
                  name: app.name,
                  description: app.description,
                })
                setCreateAppResponse(app)
                navigate(`/accounts/${accountId}/apps/${app.id}`)
              }}
              cancelClicked={() => navigate(`/accounts/${accountId}/apps`)}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

function CreateAppForm(props?: {
  onAppCreated?: (app: CreateAppResponseDto) => void
  cancelClicked?: () => void
}) {
  const [makeAppPublic, setMakeAppPublic] = useState(false)

  const { account, me } = useAppStore()
  const {
    register,
    handleSubmit,
    formState: { errors: validationErrors },
    reset: resetForm,
  } = useForm({
    defaultValues: {
      appName: '',
      appHandle: '',
      description: '',
      appInfoUrl: '',
    },
  })

  const {
    isLoading: isSubmitting,
    isError,
    error,
    isSuccess,
    mutate,
  } = useCreateApp({ onSuccess: onAppCreated })

  function onSubmit(data: {
    appName: string
    description: string
    appHandle: string
  }) {
    const dto: CreateAppDto = {
      accountId: account?.id,
      name: data.appName,
      description: data.description,
      iconUrl: null,
      isPublic: makeAppPublic,
      handle: `${me?.user.username}/${data.appHandle}`,
    }
    mutate(dto)
  }

  function onAppCreated(createdApp: CreateAppResponseDto) {
    resetForm()
    props?.onAppCreated?.(createdApp)
  }

  return (
    <form className="space-y-6 bg-white pt-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="px-8 py-5 space-y-4">
        <ErrorDisplay isError={isError} error={error} title="" />
        <SuccessDisplay
          show={isSuccess}
          title=""
          message={'App created successfuly'}
        />
        <div>
          <label
            htmlFor="appName"
            className="block text-sm font-medium text-gray-700"
          >
            App name
          </label>
          <input
            {...register('appName', { required: 'Please enter the app name' })}
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {validationErrors.appName ? (
            <span className="text-sm text-red-700">
              {validationErrors.appName?.message}
            </span>
          ) : undefined}
        </div>
        <div>
          <label
            htmlFor="appHandle"
            className="block text-sm font-medium leading-6 text-gray-900"
          >
            App handle
          </label>
          <div className="mt-2">
            <div className="flex rounded-md shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-inset focus-within:ring-indigo-600 sm:max-w-md">
              <span className="flex select-none items-center pl-3 text-gray-500 sm:text-sm">
                @{me?.user.username}/
              </span>
              <input
                type="text"
                {...register('appHandle', {
                  required: 'Choose a handle for your app',
                })}
                className="block flex-1 border-0 bg-transparent py-1.5 pl-1 text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:text-sm sm:leading-6"
                placeholder="my-app"
              />
            </div>
            {validationErrors.appHandle ? (
              <span className="text-sm text-red-700">
                {validationErrors.appHandle?.message}
              </span>
            ) : (
              <span className="text-xs font-thin">
                A handle helps identify your app in the App registry. It cannot
                be changed later.
              </span>
            )}
          </div>
        </div>
        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium  text-gray-700"
          >
            Description
          </label>
          <textarea
            {...register('description', { required: false })}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-electricIndigo-500 focus:ring-electricIndigo-500 sm:text-sm"
          />
          <span className="text-xs font-thin">
            Give a brief description of what your app does
          </span>
        </div>
        <div>
          <label
            htmlFor="infoUrl"
            className="block text-sm font-medium text-gray-700"
          >
            App info URL
          </label>

          <input
            {...register('appInfoUrl', { required: false })}
            type="url"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          />
          {validationErrors.appInfoUrl ? (
            <span className="text-sm text-red-700">
              {validationErrors.appInfoUrl?.message}
            </span>
          ) : (
            <span className="text-xs font-thin">
              A link where users can learn more about your app
            </span>
          )}
        </div>

        <div>
          <PrimarySwitch
            defaultValue={makeAppPublic}
            onChange={setMakeAppPublic}
            label="Make this app available to everyone"
          />
        </div>
      </div>

      <div className="flex flex-row-reverse gap-2 bg-gray-50 px-8 py-3 text-right">
        <PrimaryButton
          text="Save"
          type="submit"
          short={false}
          isLoading={isSubmitting}
        />
        <PrimaryOutlineButton
          text="Cancel"
          short={false}
          onClick={props.cancelClicked}
        />
      </div>
    </form>
  )
}
