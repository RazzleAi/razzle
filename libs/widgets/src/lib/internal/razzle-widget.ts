import { RazzleWidgetType } from '../common/widget-type'

export interface IRazzleWidget {
  children?: IRazzleWidget[]
  readonly type: RazzleWidgetType
}
