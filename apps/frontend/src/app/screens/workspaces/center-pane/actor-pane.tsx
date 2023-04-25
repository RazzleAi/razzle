import { ActionPlanWithDetailsDto, StepDto } from '@razzle/dto'
import { Fragment } from 'react'
import ActionPaneField, {
  FieldType,
} from '../../../components/action-pane-field'
import { Divider } from '../../../components/divider'
import { useFirebaseServices } from '../../../firebase'
import { useHotKeys } from '../../../hooks/useHotKey'
import { useAppStore } from '../../../stores/app-store'
import { useWSClientStore } from '../../../stores/ws-client-store'
import { varNameToName } from '../../../utils/var-to-sentence'
import { dateFromString } from './helpers'
import { useHandleMessage } from './queries'
import { BiError } from 'react-icons/bi'
import { useWorkspacesStateStore } from '../workspaces-state-store'
import { Spinner } from '../../../components/spinners'
import { useEventTracker } from '../../../mixpanel'
import { ACTION_TRIGGERED } from '../../../events'
import { PrimaryButton } from '../../../components/buttons'

interface ActorPaneProps {
  prompt: string
  done: () => void
}

export default function ActorPane(props: ActorPaneProps) {
  const { currentWorkspace } = useAppStore()
  const { sendMessage } = useWSClientStore()
  const {
    steps,
    setSteps,
    toggleActorPane: setIsActorPaneOpen,
  } = useWorkspacesStateStore()
  const { trackEvent } = useEventTracker()

  const { currentUser } = useFirebaseServices()
  const prompt = props.prompt ? props.prompt : ''

  const { isLoading: isActionPlanLoading } = useHandleMessage(
    currentWorkspace?.id,
    prompt,
    {
      onSuccess: (data) => {
        if (!props.prompt) {
          return
        }
        // const newActionPlan = formatDataAndArgs(data)
        
        setSteps(data)
        setIsActorPaneOpen(true)
      },
      enabled: true,
    }
  )

  const isEditing = false

  useHotKeys({
    key: 'Enter',
    componentName: 'ActorPane',
    includeMetaKey: true,
    callback: () => {
      performAction()
    },
  })

  useHotKeys({
    key: 'Escape',
    componentName: 'ActorPane',
    includeMetaKey: false,
    callback: () => {
      setSteps(undefined)
      setIsActorPaneOpen(false)
      props.done()
    },
  })

  async function performAction() {
    // trackEvent(ACTION_TRIGGERED, {
    //   action: actionPlan[0].actionName,
    //   app: actionPlan[0].appId,
    //   prompt: prompt,
    // })
    console.debug('performing action', {prompt: props.prompt})
    const accessToken = await currentUser?.getIdToken()
    // sendMessage(accessToken, {
    //   event: 'CallAction',
    //   data: {
    //     payload: {prompt: prompt, steps},
    //   },
    // })
    props.done()
    setSteps(undefined)
    setIsActorPaneOpen(false)
  }

  function changeArg(uuid: string, argName: string, argValue: string) {
    // if (!steps) {
    //   return
    // }

    // const newDataAndArgs = actionPlan.map((action) => {
    //   if (action.uuid === uuid) {
    //     action.args = action.args.map((arg) => {
    //       if (arg.name === argName) {
    //         arg.value = argValue
    //       }
    //       return arg
    //     })
    //   }
    //   return action
    // })

    // setActionPlan(newDataAndArgs)
    // setIsActorPaneOpen(true)
  }

  const buttonIsDisabled =
    isEditing ||
    isActionPlanLoading ||
    !steps
    // (steps || []).some((action) => action.isError)

  return (
    <div className="flex flex-col rounded-xl border-[#E8EBED] border shadow-slate-500/10 shadow-xs shadow py-5">
      {isActionPlanLoading && (
        <div className="flex flex-row px-6 mb-1 w-100">
          <div className="flex flex-row mb-4 justify-start items-center w-full gap-3">
            <Spinner size="small" thumbColorClass="fill-electricIndigo-500" />{' '}
            <span className="text-sm font-semibold text-gray-600">
              Loading...
            </span>
          </div>
        </div>
      )}
      <div className="w-100">
        {steps?.map((step, index) => {
          return (
            <Fragment key={`${step.id}-${index}`}>
              {step.isError ? (
                <div className="flex flex-col px-6 mb-2 bg-red-200 border border-red-300 items-center mx-3 rounded-lg">
                  <div className="flex flex-row my-2 items-center w-full h-full gap-1">
                    <BiError size={20} className="text-red-900" />
                    <p className="text-sm text-red-900">
                      {step.errorMessage}
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-row px-6 mb-1">
                    <div className="flex flex-row mb-4 justify-between w-full gap-3">
                      <span className="text-sm font-medium text-[#292929]">
                        <b>Ax</b> | {varNameToName(step?.actionName ?? '')}
                      </span>
                      <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-medium text-purple-800">
                        {step.appName}
                      </span>
                    </div>
                  </div>
                  <Divider />
                </>
              )}

              <div className="px-6">
                {step.actionInput.map((arg, index) => {
                  return (
                    <div key={`${index}-${arg.name}`} className="flex flex-col">
                      <ActionPaneField
                        argName={arg.name}
                        argValue={arg.value as any}
                        type={arg.type as FieldType}
                        onChange={(argName: string, argValue: string) => {
                          changeArg(step.id.toString(), argName, argValue)
                        }}
                      />
                      <Divider />
                    </div>
                  )
                })}
              </div>
            </Fragment>
          )
        })}
      </div>
      <div className="px-6 flex w-full items-center justify-center">
        <div className="flex w-1/4 text-sm">
          press{' '}
          <span className="bg-slate-600 px-2 mx-1 text-white h-auto rounded-md">
            esc
          </span>{' '}
          to cancel
        </div>
        <div className="flex w-full justify-end">
          {
            <PrimaryButton
              type="button"
              disabled={buttonIsDisabled}
              text="Go (ctrl + enter)"
              onClick={() => performAction()}
            />
          }
        </div>
      </div>
    </div>
  )
}

// function formatDataAndArgs(
//   data: StepDto[]
// ): StepDto[] {
//   console.debug('formatting data and args: ', data)
//   return data.map((step) => {
//     return {
//       ...step,
//       args: step.action.args.map((arg) => {
//         if (typeof arg === 'string') {
//           return {
//             ...arg,
//             value: formatArgByType(arg.type, arg.value),
//           }
//         }
//         return arg
//       }),
//     }
//   })
// }

function formatArgByType(type: string, value: string): string {
  switch (type) {
    case 'string':
    case 'number':
    case 'boolean':
      return value
    case 'date':
      return dateFromString(value).toISOString()
    default:
      return value
  }
}
