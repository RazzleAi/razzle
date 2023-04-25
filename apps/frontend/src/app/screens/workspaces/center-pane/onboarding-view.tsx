import { Disclosure, Transition } from '@headlessui/react'
// import { Progress } from 'flowbite-react'
import { useFirebaseServices } from '../../../firebase'
import { FiChevronDown } from 'react-icons/fi'
import { MdAppRegistration } from 'react-icons/md'
import {
  PrimaryButton,
  PrimaryOutlineButton,
} from '../../../components/buttons'
import { useNavigate, useParams } from 'react-router-dom'
import { OnboardingDto } from '@razzle/dto'
import {
  AiOutlineCheck,
  AiOutlineFunction,
  AiOutlineSync,
} from 'react-icons/ai'
import { BsFillCheckCircleFill } from 'react-icons/bs'
import { useGetUnsyncedAppsInAccount } from '../../queries'
import { WarningDisplay } from '../../../components/warning-display'
import CopyBytton from '../../../components/copy-button'
import { Spinner } from '../../../components/spinners'
import { useOnboardingStore } from '../../../stores/onboarding.store'
import trigger_action_illustration from '../../../../assets/images/onboard_trigger_action.png'
import { useEventTracker } from '../../../mixpanel'
import {
  ONBOARDING_COPY_API_KEY_CLICKED,
  ONBOARDING_COPY_APP_ID_CLICKED,
} from '../../../events'

export function OnboardingView() {
  const { currentUser } = useFirebaseServices()
  const firstName = (currentUser?.displayName ?? 'User').split(' ')[0]

  return (
    <div className="flex flex-col w-full h-full justify-center">
      <div className="flex flex-col self-center w-2/4 h-auto justify-center">
        <div className="flex flex-col items-center justify-center mb-10">
          <h3 className="text-3xl text-gray-700 mb-1">
            Hello {firstName}, welcome to Razzle
          </h3>
          <span className="text-lg font-medium text-center text-gray-500">
            Follow these steps below to get started. You can learn more{' '}
            <a
              className="text-electricIndigo-500 hover:underline"
              href="https://razzle.ai"
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>
          </span>
        </div>
        <div className="flex flex-col bg-white rounded-lg shadow-lg border divide-y border-gray-100">
          <TitleAndProgress />
          <CreateAppStep />
          <SyncAppStep />
          <TriggerActionStep />
        </div>
      </div>
    </div>
  )
}

function calcOnboardingProgress(onboarding: OnboardingDto) {
  if (!onboarding.appCreated) {
    return 0
  }

  if (!onboarding.appSynced) {
    return 33
  }

  if (!onboarding.firstActionTriggered) {
    return 66
  }

  return 100
}

function TitleAndProgress() {
  const { onboarding } = useOnboardingStore()
  const progress = calcOnboardingProgress(onboarding)
  return (
    <div className="w-full py-4 px-6 flex flex-col items-center justify-center gap-3">
      <h4 className="text-xl text-gray-600 font-semibold mb-2">Setup guide</h4>
      <div className="w-full">
        <Progress progress={progress} />
      </div>
    </div>
  )
}

function Progress({ progress }: { progress: number }) {
  return (
    <div className="w-full h-2 bg-gray-300 rounded-lg">
      <div
        style={{ width: progress + '%' }}
        className="h-full bg-green-500 rounded-lg"
      ></div>
    </div>
  )
}

function CreateAppStep() {
  const navigate = useNavigate()
  const { onboarding } = useOnboardingStore()

  return (
    <Disclosure as="div" className="flex flex-col w-full bg-white">
      {({ open }) => (
        <div className="flex flex-col ui-open:bg-gray-100 divide-y ui-not-open:bg-white transition-colors duration-500">
          <Disclosure.Button
            as="div"
            className="cursor-pointer flex flex-row justify-between w-full h-full py-6 px-6 "
          >
            <div className="flex flex-row gap-4 items-center">
              <MdAppRegistration size={30} className="text-gray-700" />
              <span className="text-base font-semibold text-gray-700">
                Create your first app
              </span>
              {onboarding.appCreated && (
                <BsFillCheckCircleFill size={20} className="text-green-500" />
              )}
            </div>
            <FiChevronDown
              size={20}
              className="ui-open:rotate-180 ui-not-open:rotate-0 ui-open:transform transition-transform duration-500"
            />
          </Disclosure.Button>
          <Transition
            enter="transition duration-75 ease-out"
            enterFrom="transform origin-top scale-y-0 opacity-0"
            enterTo="transform origin-top scale-y-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform origin-top scale-y-100 opacity-100"
            leaveTo="transform origin-top scale-y-0 opacity-0"
          >
            <Disclosure.Panel
              as="div"
              className="relative flex flex-col w-full px-6 py-6"
            >
              {onboarding.appCreated && (
                <div className="flex flex-row items-center gap-2">
                  <AiOutlineCheck
                    size={18}
                    className="text-green-500 duration-500"
                  />
                  <span>First app created</span>
                </div>
              )}
              {!onboarding.appCreated && (
                <div className="flex flex-col gap-3">
                  <div>
                    <p className="text-sm text-gray-500">
                      With apps, you can expose actions on internal systems to
                      your users.
                    </p>
                  </div>
                  <div className="flex flex-row items-start gap-2">
                    <PrimaryButton
                      text="Create app"
                      onClick={() => {
                        navigate('apps/create')
                      }}
                    />
                    <PrimaryOutlineButton text="Learn more" />
                  </div>
                </div>
              )}
            </Disclosure.Panel>
          </Transition>
        </div>
      )}
    </Disclosure>
  )
}

function SyncAppStep() {
  const { accountId } = useParams()
  const { trackEvent } = useEventTracker()
  const { onboarding } = useOnboardingStore()
  const { isLoading: isLoadingApps, data: unsyncedApps } =
    useGetUnsyncedAppsInAccount(accountId, {
      enabled: onboarding && onboarding.appSynced ? false : true,
      refetchInterval: onboarding && onboarding.appSynced ? false : 5000,
      refetchOnWindowFocus: false,
    })
  const unsyncedApp = unsyncedApps?.[0]

  return (
    <Disclosure as="div" className="flex flex-col w-full bg-white">
      {({ open }) => (
        <div className="flex flex-col ui-open:bg-gray-100 divide-y ui-not-open:bg-white transition-colors duration-500">
          <Disclosure.Button
            as="div"
            className="cursor-pointer flex flex-row justify-between w-full h-full py-6 px-6 "
          >
            <div className="flex flex-row gap-4 items-center">
              <AiOutlineSync size={30} className="text-gray-700" />
              <span className="text-base font-semibold text-gray-700">
                Sync your app
              </span>
              {onboarding.appSynced && (
                <BsFillCheckCircleFill size={20} className="text-green-500" />
              )}
            </div>
            <FiChevronDown
              size={20}
              className="ui-open:rotate-180 ui-not-open:rotate-0 ui-open:transform transition-transform duration-500"
            />
          </Disclosure.Button>
          <Transition
            enter="transition duration-75 ease-out"
            enterFrom="transform origin-top scale-y-0 opacity-0"
            enterTo="transform origin-top scale-y-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform origin-top scale-y-100 opacity-100"
            leaveTo="transform origin-top scale-y-0 opacity-0"
          >
            <Disclosure.Panel
              as="div"
              className="relative flex flex-col w-full px-6 py-6"
            >
              {isLoadingApps && (
                <div className="absolute flex flex-row items-center justify-center top-0 left-0 w-full h-full bg-white opacity-80 z-20">
                  <Spinner
                    size="small"
                    thumbColorClass="fill-electricIndigo-500"
                  />
                </div>
              )}
              <div className="flex flex-col gap-3">
                {!onboarding.appSynced && (
                  <div className="flex flex-row items-center gap-2">
                    <AiOutlineSync
                      size={18}
                      className="text-gray-700 animate-spin-slow duration-500"
                    />
                    <span>Waiting for app sync</span>
                  </div>
                )}
                {onboarding.appSynced && (
                  <div className="flex flex-row items-center gap-2">
                    <AiOutlineCheck
                      size={18}
                      className="text-green-500 duration-500"
                    />
                    <span>App Sync successful</span>
                  </div>
                )}
                {onboarding && onboarding.appSynced
                  ? undefined
                  : unsyncedApp && (
                      <>
                        <div className="text-gray-700">
                          <h3 className="font-semibold">
                            How to sync your app
                          </h3>
                          <p className="text-sm text-gray-500">
                            To sync your app, you'll need to copy the App ID and
                            API key for your app from below use them to
                            initialize your Razzle app using the Razzle SDK.
                          </p>
                          <a
                            href="https://github.com/RazzleAi/docs/blob/master/quick-start.md"
                            className="text-sm text-electricIndigo-500 font-semibold"
                            target="_blank"
                            rel="noreferrer"
                          >
                            Learn more about how to sync your app
                          </a>
                        </div>
                        <div>
                          <h4 className="text-base text-gray-600 font-semibold">
                            App Details: {unsyncedApp.name}
                          </h4>
                          <div className="mt-2">
                            <WarningDisplay
                              title=""
                              message="Make sure to copy your new API key now. You won’t be able to see it again."
                              show={true}
                              dismissable={false}
                            />
                            <div className="mb-2">
                              <label className="font-semibold text-gray-600 mb-1 text-sm">
                                App ID
                              </label>
                              <div className="flex flex-row gap-2 items-center text-gray-600">
                                <div className="px-1 py-2 bg-gray-200 border border-gray-400 shadow-inner overflow-auto rounded-md">
                                  {unsyncedApp.appId}
                                </div>
                                <CopyBytton
                                  text={unsyncedApp.appId}
                                  tooltip="Copy App ID"
                                  onClick={() => {
                                    trackEvent(ONBOARDING_COPY_APP_ID_CLICKED, {
                                      ...unsyncedApp,
                                    })
                                  }}
                                />
                              </div>
                            </div>

                            <label className="font-semibold text-gray-600 mb-1 text-sm">
                              API Key
                            </label>
                            <div className="flex flex-row gap-2 items-center text-gray-600">
                              <div className="px-1 py-2 bg-gray-200 border border-gray-400 shadow-inner overflow-auto rounded-md">
                                {unsyncedApp.apiKey}
                              </div>
                              <CopyBytton
                                text={unsyncedApp.apiKey}
                                tooltip="Copy API key"
                                onClick={() => {
                                  trackEvent(ONBOARDING_COPY_API_KEY_CLICKED, {
                                    ...unsyncedApp,
                                  })
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
              </div>
            </Disclosure.Panel>
          </Transition>
        </div>
      )}
    </Disclosure>
  )
}

function TriggerActionStep() {
  const { onboarding } = useOnboardingStore()

  return (
    <Disclosure as="div" className="flex flex-col w-full bg-white">
      {({ open }) => (
        <div className="flex flex-col ui-open:bg-gray-100 divide-y ui-not-open:bg-white transition-colors duration-500">
          <Disclosure.Button
            as="div"
            className="cursor-pointer flex flex-row justify-between w-full h-full py-6 px-6 "
          >
            <div className="flex flex-row gap-4 items-center">
              <AiOutlineFunction size={30} className="text-gray-700" />
              <span className="text-base font-semibold text-gray-700">
                Trigger your first action
              </span>
              {onboarding.firstActionTriggered && (
                <BsFillCheckCircleFill size={20} className="text-green-500" />
              )}
            </div>
            <FiChevronDown
              size={20}
              className="ui-open:rotate-180 ui-not-open:rotate-0 ui-open:transform transition-transform duration-500"
            />
          </Disclosure.Button>
          <Transition
            enter="transition duration-75 ease-out"
            enterFrom="transform origin-top scale-y-0 opacity-0"
            enterTo="transform origin-top scale-y-100 opacity-100"
            leave="transition duration-75 ease-out"
            leaveFrom="transform origin-top scale-y-100 opacity-100"
            leaveTo="transform origin-top scale-y-0 opacity-0"
          >
            <Disclosure.Panel
              as="div"
              className="relative flex flex-col w-full px-6 py-6"
            >
              {onboarding.firstActionTriggered && (
                <div className="flex flex-row items-center gap-2">
                  <AiOutlineCheck
                    size={18}
                    className="text-green-500 duration-500"
                  />
                  <span>First action triggered</span>
                </div>
              )}
              {onboarding?.firstActionTriggered || false ? undefined : (
                <div className="text-gray-700">
                  <h3 className="font-semibold">How trigger an action</h3>
                  <p className="text-sm text-gray-500">
                    You can trigger an action from the list of actions in the
                    Sidebar
                  </p>
                  <div className="w-full flex flex-row justify-center mt-3">
                    <img
                      src={trigger_action_illustration}
                      alt=""
                      className="w-56 border-dashed border-[3px] border-gray-300"
                    />
                  </div>
                  {/* TODO: image here */}
                </div>
              )}
            </Disclosure.Panel>
          </Transition>
        </div>
      )}
    </Disclosure>
  )
}
