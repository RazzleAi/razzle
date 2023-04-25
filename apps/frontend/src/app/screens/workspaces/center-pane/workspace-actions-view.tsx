/* eslint-disable jsx-a11y/anchor-is-valid */
import { Fragment, useEffect, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import {
  StepDto,
  WorkspaceActionDto,
  WorkspaceDto,
} from '@razzle/dto'
import { varNameToName } from '../../../utils/var-to-sentence'
import { useWorkspacesStateStore } from '../workspaces-state-store'
import { Spinner } from '../../../components/spinners'
import { useDebouncedValue } from '../../../hooks'
import { useEventTracker } from '../../../mixpanel'
import { WORKSPACE_ACTION_CLICKED } from '../../../events'
import { useGetWorkspaceActions, useSearchWorkspaceActions } from '../../queries'

export default function WorkspaceActionsView(props?: {
  workspace: WorkspaceDto
  onClose?: () => void
}) {
  const [open, setOpen] = useState(true)
  const { setSteps, toggleActorPane: setIsActorPaneOpen } =
    useWorkspacesStateStore()
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 500)
  const { trackEvent } = useEventTracker()

  const {
    data: workspaceActions,
    error,
    isLoading,
  } = useGetWorkspaceActions(props.workspace.id)

  const {
    data: searchActionsResults,
    isLoading: isSearchingActions,
    refetch: searchActions,
  } = useSearchWorkspaceActions(props.workspace.id, debouncedSearchQuery, {
    enabled: false,
  })

  useEffect(() => {
    if (!open) {
      props?.onClose?.()
    }
  }, [open, props])

  useEffect(() => {
    searchActions()
  }, [debouncedSearchQuery, searchActions])

  const filteredActions =
    searchActionsResults && searchActionsResults.length > 0
      ? searchActionsResults
      : workspaceActions

  function handleActionClick(action: WorkspaceActionDto) {
    trackEvent(WORKSPACE_ACTION_CLICKED, { ...action })
    const steps: StepDto[] = []
    steps.push({
      id: 1,
      actionName: action.actionName,
      appId: action.appId,
      razzleAppId: action.razzleAppId,
      appDescription: action.appDescription,      
      appName: action.appName,
      actionDescription: action.actionDescription,
      actionInput: action.parameters.map((p) => ({
        name: p.name,
        type: p.type,
        value: null,
      })),
    })

    setSteps(steps)
    setIsActorPaneOpen(true)
    setOpen(false)
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={setOpen}>
        <div className="fixed inset-0" />

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500 sm:duration-700"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500 sm:duration-700"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="p-6 bg-gray-100">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-gray-900">
                          Available actions
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-transparent text-gray-400 hover:text-gray-500"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex w-full">
                      <div className="relative flex flex-row w-full mt-1 px-1 rounded-md shadow-sm">
                        <input
                          onChange={(e) => {
                            setSearchQuery(e.target.value)
                          }}
                          type="text"
                          autoComplete="off"
                          className="flex flex-grow rounded-md focus:ring- focus:ring-0 border-none ring-0 sm:text-sm"
                          placeholder="search for what you want to do"
                        />
                        {isSearchingActions ? (
                          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                            <Spinner
                              size="small"
                              thumbColorClass="fill-electricIndigo-500"
                              aria-hidden="true"
                            />
                          </div>
                        ) : undefined}
                      </div>
                    </div>
                    <ul className="flex-1 divide-y divide-gray-200 overflow-y-auto">
                      {filteredActions &&
                        filteredActions.map((action) => (
                          <li key={action.actionName}>
                            <a
                              href="#"
                              onClick={(e) => {
                                e.preventDefault()
                                handleActionClick(action)
                              }}
                              className="block hover:bg-gray-50"
                            >
                              <div className="px-4 py-4 sm:px-6">
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-[#292929]">
                                    <b>Ax</b> |{' '}
                                    {varNameToName(action.actionName)}
                                  </span>
                                  {/* <p className="truncate text-sm font-medium text-gray-700">
                                    {action.action}
                                  </p> */}
                                  <div className="ml-2 flex flex-shrink-0">
                                    <p className="inline-flex rounded-full bg-purple-100 px-2 text-xs font-semibold leading-5 text-purple-800">
                                      {action.appName}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-xs text-gray-500 mt-1">
                                  {action.actionDescription}
                                </div>
                              </div>
                            </a>
                          </li>
                        ))}
                    </ul>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
