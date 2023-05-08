import {
  IActionTrigger,
  IWidgetPadding,
  RazzleTextSize,
  RazzleTextWeight,
} from '../common'
import { IRazzleWidget } from './razzle-widget'

export interface IRazzleLink extends IRazzleWidget {
  readonly action: IActionTrigger
  readonly padding?: IWidgetPadding
  readonly textSize?: RazzleTextSize
  readonly textWeight?: RazzleTextWeight
  readonly textColor?: string
  readonly textAlignment?: 'left' | 'center' | 'right'
}
