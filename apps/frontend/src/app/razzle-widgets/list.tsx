import {
  ActionAndArgsDto,
  ActionPlanWithDetailsDto,
  AgentSyncActionParametersDto,
  StepDto,
} from '@razzle/dto'
import { IRazzleList, IActionTrigger } from '@razzle/widgets'
import { useMessageDetails } from '../screens/workspaces/center-pane/history-item-view'
import { useAppStore } from '../stores/app-store'
import { useWSClientStore } from '../stores/ws-client-store'
import { useGetActionArgs } from './api'
import { v4 as uuidv4 } from 'uuid'
import { useFirebaseServices } from '../firebase'
export interface ListProps {
  list: IRazzleList
}

export function List(props: ListProps) {
  return (
    <div className="flex flex-col">
      {props.list.title && <ListTitle title={props.list.title} />}
      {props.list.items.map((item, index) => {
        return (
          <ListItem
            key={index}
            text={item.text}
            onSelect={item.onSelect}
            actions={item.actions}
          />
        )
      })}
    </div>
  )
}

function ListTitle({ title }: { title: string }) {
  return (
    <div className="flex px-6 py-3 text-sm rounded-t bg-gray-100 font-semibold border-b">
      {title}
    </div>
  )
}

function ListItem({
  text,
  onSelect,
  actions,
}: {
  text: string
  onSelect?: IActionTrigger
  actions?: IActionTrigger[]
}) {
  const hasActions = actions !== undefined && actions.length > 0
  const isSelectable = !hasActions && onSelect !== undefined
  const messageDetails = useMessageDetails()
  const { account, currentWorkspace } = useAppStore()
  const { triggerActions } = useWSClientStore()
  const { mutate: getOnSelectActionArgs, error: onSelectActionArgsFetchError } =
    useGetActionArgs({ onSuccess: onActionArgsLoaded })
  const { currentUser } = useFirebaseServices()

  function onItemSelected() {
    getOnSelectActionArgs({
      appId: messageDetails.appId,
      action: onSelect?.action,
    })
  }

  function onActionArgsLoaded(actionAndArgs: ActionAndArgsDto) {
    const steps: StepDto[] = []
    steps.push({
      id: 1,
      actionName: actionAndArgs.actionName,
      actionDescription: actionAndArgs.actionDescription,
      razzleAppId: messageDetails.applicationId,
      appId: messageDetails.appId,
      appName: messageDetails.appName,
      appDescription: messageDetails.appDescription,
      actionInput: actionAndArgs.args.map((a, idx) => ({
        name: a.name,
        type: a.type,
        value: onSelect.args[idx],
      })),
    })

    if (account && currentWorkspace) {
      currentUser?.getIdToken().then((accessToken) => {
        triggerActions(accessToken, account.id, currentWorkspace.id, steps)
      })
    }
  }

  return (
    <div
      className={
        'flex flex-col px-6 py-3 text-sm border-b last:border-b-0 ' +
        (isSelectable
          ? 'cursor-pointer hover:bg-gray-50 active:bg-gray-100'
          : '')
      }
      onClick={isSelectable ? onItemSelected : undefined}
    >
      <div>{text}</div>

      {hasActions && <ListItemActions actions={actions} />}
    </div>
  )
}

function ListItemActions({ actions }: { actions: IActionTrigger[] }) {
  return (
    <div className="flex flex-row gap-2 mt-1">
      {actions.map((action, index) => {
        return (
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          <ListItemAction key={index} action={action} />
        )
      })}
    </div>
  )
}

function ListItemAction({ action }: { action: IActionTrigger }) {
  const messageDetails = useMessageDetails()
  const { currentUser } = useFirebaseServices()
  const { triggerActions } = useWSClientStore()
  const { account, currentWorkspace } = useAppStore()
  const { mutate: getActionArgs, error: actionArgsError } = useGetActionArgs({
    onSuccess: onActionArgsLoaded,
  })

  function onClicked() {
    getActionArgs({
      appId: messageDetails.appId,
      action: action.action,
    })
  }

  function onActionArgsLoaded(actionAndArgs: ActionAndArgsDto) {
    const steps: StepDto[] = []
    steps.push({
      id: 1,
      actionName: action.action,
      actionDescription: actionAndArgs.actionDescription,
      appId: messageDetails.appId,
      razzleAppId: messageDetails.applicationId,
      appDescription: messageDetails.appDescription,
      appName: messageDetails.appName,
      actionInput: actionAndArgs.args.map((a, idx) => ({
        name: a.name,
        type: a.type,
        value: action.args[idx],
      })),
    })

    if (account && currentWorkspace) {
      currentUser?.getIdToken().then((accessToken) => {
        triggerActions(accessToken, account.id, currentWorkspace.id, steps)
      })
    }
  }

  return (
    <span
      onClick={onClicked}
      className="text-xs cursor-pointer underline text-electricIndigo-500"
    >
      {action.label || action.action}
    </span>
  )
}
