import { IWidgetPadding, RazzleTextSize, RazzleTextWeight } from '../common'
import { IRazzleWidget } from './razzle-widget'

export interface IRazzleText extends IRazzleWidget {
  text: string
  padding?: IWidgetPadding
  textSize?: RazzleTextSize
  textWeight?: RazzleTextWeight
  textColor?: string
}
