import {
  ActionPlanWithDetailsDto,
  StepDto,
  WorkspaceActionDto,
} from '@razzle/dto'
import { useEffect, useState } from 'react'
import { WORKSPACE_ACTION_CLICKED } from '../../../events'
import { useDebouncedValue } from '../../../hooks'
import { useEventTracker } from '../../../mixpanel'
import { useAppStore } from '../../../stores/app-store'
import {
  useGetWorkspaceActions,
  useSearchWorkspaceActions,
} from '../../queries'
import { v4 as uuid } from 'uuid'
import { useWorkspacesStateStore } from '../../workspaces/workspaces-state-store'
import { AiOutlineSearch } from 'react-icons/ai'
import { CgSpinner } from 'react-icons/cg'
import { Step } from '@razzle/domain'

export function LeftPaneNavbar() {
  return (
    <div className="flex flex-col grow  pb-6 border-[#E8EBED] w-[330px] border-r">
      <div className="flex flex-col w-full h-[calc(100vh)-50px] overflow-y-scroll">
        <ActionsList />
        <div className="flex flex-grow"></div>
      </div>
    </div>
  )
}

export function ActionsList() {
  const { trackEvent } = useEventTracker()
  const { currentWorkspace: workspace } = useAppStore()
  const { setSteps, toggleActorPane: setIsActorPaneOpen } =
    useWorkspacesStateStore()
  const [searchQuery, setSearchQuery] = useState('')
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 500)

  const { data: workspaceActions, isLoading: isLoadingUsers } =
    useGetWorkspaceActions(workspace?.id)

  const {
    data: searchActionsResults,
    isLoading: isSearchingActions,
    refetch: searchActions,
  } = useSearchWorkspaceActions(debouncedSearchQuery, workspace?.id, {
    enabled: false,
  })

  useEffect(() => {
    searchActions()
  }, [debouncedSearchQuery, searchActions])

  const filteredActions =
    searchActionsResults && searchActionsResults.length > 0
      ? searchActionsResults
      : workspaceActions

  const groupedActionsByAppName = filteredActions?.reduce((acc, action) => {
    const appName = action.appName
    if (!acc[appName]) {
      acc[appName] = []
    }
    acc[appName].push(action)
    return acc
  }, {} as Record<string, WorkspaceActionDto[]>)

  function handleActionClick(action: WorkspaceActionDto) {
    trackEvent(WORKSPACE_ACTION_CLICKED, { ...action })
    const steps: StepDto[] = []
    steps.push({
      id: 1,
      actionName: action.actionName,
      actionDescription: action.actionDescription,
      appId: action.appId,
      razzleAppId: action.razzleAppId,
      appName: action.appName,
      appDescription: action.appDescription,
      actionInput: action.parameters.map((p) => ({
        name: p.name,
        type: p.type,
        value: null,
      })),
    })

    setSteps(steps)
    setIsActorPaneOpen(true)
  }

  return (
    <div>
      <ActionSearchbar
        onChange={(text) => {
          setSearchQuery(text)
        }}
        isLoading={isSearchingActions || isLoadingUsers}
      />
      {groupedActionsByAppName ? (
        Object.entries(groupedActionsByAppName).map(([appName, actions]) => (
          <div className="" key={appName}>
            <div className="flex flex-row py-3 px-2 bg-electricIndigo-50 border-t border-b border-gray-200 items-center w-full cursor-pointer">
              <span className="text-sm font-semibold text-black whitespace-nowrap">
                {appName}
              </span>
            </div>

            <div className="flex flex-col  ">
              {actions.map((action) => (
                <button
                  key={action.actionName}
                  className="flex flex-row items-center gap-1 px-2 py-3 hover:bg-gray-50 text-black text-left"
                  onClick={() => {
                    handleActionClick(action)
                  }}
                >
                  <span className="text-sm">{action.actionDescription}</span>
                </button>
              ))}
            </div>
          </div>
        ))
      ) : (
        <></>
      )}
    </div>
  )
}

function ActionSearchbar({
  isLoading,
  onChange,
}: {
  isLoading: boolean
  onChange: (text: string) => void
}) {
  return (
    <div className="relative flex flex-row w-full items-center">
      <div className="flex flex-row items-center rounded-sm w-full bg-gray-100 ">
        <input
          type="text"
          placeholder="Search"
          onChange={(e) => onChange(e.target.value)}
          className="text-sm w-full py-3 bg-gray-100 outline-none border-none placeholder:text-sm ring-0 focus:ring-0 focus:outline-none"
        />
        <div className="mr-2">
          {isLoading ? (
            <CgSpinner size={18} className="animate-spin" />
          ) : (
            <AiOutlineSearch size={18} className="" />
          )}
        </div>
      </div>
    </div>
  )
}
