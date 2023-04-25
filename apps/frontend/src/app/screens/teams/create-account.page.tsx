import { Switch } from '@headlessui/react'
import { CreateAccountResponseDto } from '@razzle/dto'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { PrimaryButton } from '../../components/buttons'
import { ErrorDisplay } from '../../components/error-display'
import { TopBar } from '../../components/top-bar'
import { CREATE_ACCOUNT, CREATE_ACCOUNT_SUCCESS } from '../../events'
import { useFirebaseServices } from '../../firebase'
import { useEventTracker } from '../../mixpanel'
import { classNames } from '../../utils/classnames'
import { useCreateAccount } from './queries'

export function CreateAccountPage() {
  const { currentUser } = useFirebaseServices()
  const defaultUserEmailDomain = extractDomain(currentUser?.email)
  const [enableDomainMatching, setEnableDomainMatching] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors: validationErrors },
  } = useForm({
    defaultValues: {
      accountName: '',
      accountDomain: defaultUserEmailDomain,
    },
  })
  const { trackEvent } = useEventTracker()
  const accountDomain = watch('accountDomain')

  const navigate = useNavigate()

  const { isLoading, isError, error, mutate } = useCreateAccount({
    onSuccess: onAccountCreated,
  })

  function onSubmit(data: { accountName: string }) {
    trackEvent(CREATE_ACCOUNT, { ...data })
    mutate({
      name: data.accountName,
      enableDomainMatching,
      matchDomain: accountDomain === '' ? undefined : accountDomain,
    })
  }

  function onAccountCreated(acct: CreateAccountResponseDto) {
    trackEvent(CREATE_ACCOUNT_SUCCESS, { ...acct })
    navigate(`/accounts/${acct.id}`)
  }

  return (
    <div className="flex flex-col items-center bg-[#F9FAFB] w-full h-[100vh]">
      <TopBar />
      <div className="w-full h-full flex flex-col items-center bg-white">
        <div className="flex flex-col w-[500px] h-full justify-center">
          <form
            className="flex flex-col w-full h-full items-center justify-center"
            action="#"
            method="POST"
            onSubmit={handleSubmit(onSubmit)}
          >
            <ErrorDisplay
              isError={isError}
              error={error}
              title="Failed to create account"
            />
            <h5 className="font-semibold text-[22px] mb-2">Create your team</h5>
            <p className="text-center text-gray-500 mb-4">
              Create a team to start using Razzle
            </p>
            <div className="w-full border border-[#ececec] rounded-lg shadow-xl px-5 py-10">
              <div className="flex flex-col items-start space-y-1 mb-4">
                <label className="text-gray-600 text-sm">Name</label>
                <input
                  {...register('accountName', {
                    required: 'Please enter your account name',
                  })}
                  type="text"
                  className=" w-full h-[50px] rounded-md border border-gray-200 shadow-sm focus:border-gray-300 focus:border focus:ring-gray-300 sm:text-sm text-start placeholder:text-gray-400 placeholder:text-start placeholder:text-xs"
                  placeholder="Razzle"
                />
                {validationErrors.accountName ? (
                  <span className="text-sm text-red-700">
                    {validationErrors.accountName?.message}
                  </span>
                ) : undefined}
              </div>

              <div className="flex flex-col items-start space-y-1 mb-4">
                <label className="text-gray-600 text-sm">
                  Domain{' '}
                  <span className="text-xs text-gray-500">(optional)</span>
                </label>
                <input
                  {...register('accountDomain', {})}
                  type="text"
                  className=" w-full h-[50px] rounded-md border border-gray-200 shadow-sm focus:border-gray-300 focus:border focus:ring-gray-300 sm:text-sm text-start placeholder:text-gray-400 placeholder:text-start placeholder:text-xs"
                  placeholder="razzle.ai"
                />
                {validationErrors.accountDomain ? (
                  <span className="text-sm text-red-700">
                    {validationErrors.accountDomain?.message}
                  </span>
                ) : undefined}
              </div>

              {accountDomain && (
                <div className="flex flex-col">
                  <EnableDomainMatchingSwitch
                    domain={accountDomain}
                    onChange={(enabled) => {
                      setEnableDomainMatching(enabled)
                    }}
                  />
                </div>
              )}
            </div>

            <div className="flex flex-row w-full mt-6 items-center justify-center">
              <PrimaryButton
                tall={true}
                fullWidth={true}
                text="Create team"
                isLoading={isLoading}
                type="submit"
              />
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

function EnableDomainMatchingSwitch(props: {
  domain: string
  onChange?: (enabled: boolean) => void
}) {
  const [enabled, setEnabled] = useState(false)

  return (
    <Switch.Group as="div" className="flex items-center">
      <Switch
        checked={enabled}
        onChange={(enabled) => {
          setEnabled(enabled)
          props?.onChange?.(enabled)
        }}
        className={classNames(
          enabled ? 'bg-electricIndigo-500' : 'bg-gray-200',
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-electricIndigo-500 focus:ring-offset-2'
        )}
      >
        <span
          aria-hidden="true"
          className={classNames(
            enabled ? 'translate-x-5' : 'translate-x-0',
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
          )}
        />
      </Switch>
      <Switch.Label as="span" className="ml-3">
        <span className="text-sm font-medium text-gray-600">
          Add new signups from "@{props.domain}" to this account
        </span>
      </Switch.Label>
    </Switch.Group>
  )
}

function extractDomain(email?: string): string {
  if (!email) return ''
  const parts = email.split('@')
  const commonDomains = ['gmail.com', 'yahoo.com', 'hotmail.com']
  if (parts.length === 2 && commonDomains.includes(parts[1])) {
    return ''
  }
  return parts[1]
}
