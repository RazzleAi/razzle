import { RazzleWidgetType } from '../common'
import { IRazzleWidget } from '../internal'

export abstract class RazzleWidget {
  abstract children?: RazzleWidget[]
  abstract getType(): RazzleWidgetType
  abstract toJSON(): IRazzleWidget
}
