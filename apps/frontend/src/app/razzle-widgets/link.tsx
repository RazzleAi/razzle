import {
  ActionAndArgsDto,
  ActionPlanWithDetailsDto,
  AgentSyncActionParametersDto,
  StepDto,
} from '@razzle/dto'
import { IRazzleLink } from '@razzledotai/widgets'
import { useFirebaseServices } from '../firebase'
import { useMessageDetails } from '../screens/workspaces/center-pane/history-item-view'
import { useAppStore } from '../stores/app-store'
import { useWSClientStore } from '../stores/ws-client-store'
import { useGetActionArgs } from './api'
import { v4 as uuidv4 } from 'uuid'
import {
  buildPaddingStyles,
  buildTextSizeClasses,
  buildTextWeightClasses,
} from './helpers'

export interface LinkProps {
  link: IRazzleLink
}

export function Link(props: LinkProps) {
  const messageDetails = useMessageDetails()
  const { account, currentWorkspace } = useAppStore()
  const { currentUser } = useFirebaseServices()
  const { triggerActions } = useWSClientStore()
  const { mutate: getActionArgs, error: actionArgsError } = useGetActionArgs({
    onSuccess: onActionArgsLoaded,
  })

  const { action, padding, textColor, textSize, textWeight, textAlignment } = props.link

  function onClicked() {
    const actionType = action.type
    if (!actionType || actionType === 'RazzleAction') {
      triggerRazzleAction()
    } else if (actionType === 'URL') {
      triggerUrl()
    }
  }

  function onActionArgsLoaded(actionAndArgs: ActionAndArgsDto) {
    const steps: StepDto[] = []
    steps.push({
      id: 1,
      actionName: action.action,
      actionDescription: actionAndArgs.actionDescription,
      appId: messageDetails.appId,
      razzleAppId: messageDetails.applicationId,
      appName: messageDetails.appName,
      appDescription: messageDetails.appDescription,
      actionInput: actionAndArgs.args.map((a, idx) => ({
        name: a.name,
        type: a.type,
        value: action.args[idx],
      })),
    })

    if (account && currentWorkspace) {
      currentUser?.getIdToken().then((accessToken) => {
        triggerActions(accessToken, account.id, currentWorkspace.id, steps, actionAndArgs.actionDescription)
      })
    }
  }

  function triggerRazzleAction() {
    getActionArgs({
      appId: messageDetails.appId,
      action: action.action,
    })
  }

  function triggerUrl() {
    const url = action.action
    if (url) {
      window.open(url, '_blank')
    }
  }

  const paddingStyles = buildPaddingStyles(padding, {
    top: 5,
    bottom: 5,
    left: 5,
    right: 5,
  })
  const textSizeClasses = buildTextSizeClasses(textSize, 'xsmall')
  const textWeightClasses = buildTextWeightClasses(textWeight, 'normal')

  return (
    <button
      onClick={onClicked}
      style={paddingStyles}
      className={`${textSizeClasses} ${textWeightClasses} flex flex-row justify-center w-full rounded border border-gray-200 bg-gray-100 hover:bg-gray-200 transition-colors duration-300`}
    >
      <span className="font-semibold text-[#5C5C5C] underline">
        {action.label || action.action}
      </span>
    </button>
  )
}
