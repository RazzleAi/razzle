import { RazzleWidgetType } from '../common'
import { IRazzleContainerWidget } from '../internal'
import { RazzleWidget } from './razzle-widget'

export abstract class RazzleContainerWidget extends RazzleWidget {
    abstract override children?: RazzleWidget[]
    abstract override getType(): RazzleWidgetType
    abstract override toJSON(): IRazzleContainerWidget
}
