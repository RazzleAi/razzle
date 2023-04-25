import { IActionTrigger } from '../common/action-trigger'
import { IRazzleWidget } from './razzle-widget'

export interface IRazzleSelectable extends IRazzleWidget {
  children?: IRazzleWidget[] | undefined
  selectionTrigger: IActionTrigger
}
