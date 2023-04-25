import { RazzleWidgetType } from '../common'
import { IActionTrigger } from '../common/action-trigger'
import { IRazzleSelectable } from '../internal/selectable'
import { RazzleWidget } from './razzle-widget'

interface SelectableProps {
  child: RazzleWidget
  selectionTrigger: IActionTrigger
}

export class Selectable extends RazzleWidget {
  readonly children?: RazzleWidget[] | undefined
  readonly selectionTrigger: IActionTrigger

  constructor(props: SelectableProps) {
    super()
    this.children = [props.child]
    this.selectionTrigger = props.selectionTrigger
  }

  getType(): RazzleWidgetType {
    return 'selectable'
  }

  toJSON(): IRazzleSelectable {
    return {
      type: this.getType(),
      selectionTrigger: this.selectionTrigger,
      children: this.children?.map((child) => child.toJSON()),
    }
  }
}
