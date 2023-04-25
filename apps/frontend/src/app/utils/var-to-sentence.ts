import { CallActionData } from '@razzle/dto'

export function generateServerMessageTitle(data: CallActionData[]) {
  const firstAction = data[0]

  // How many more actions are there?
  const moreActions = data.length - 1

  // Get the name of the first action
  const actionName = firstAction.action

  const moreActionsStr = moreActions > 0 ? ` and ${moreActions} more` : ''

  return `${varNameToName(actionName)} ${moreActionsStr}`
}

export function varNameToName(name: string) {
  return name
    ?.split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
