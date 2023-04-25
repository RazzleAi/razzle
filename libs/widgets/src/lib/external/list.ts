import { RazzleWidgetType, IActionTrigger } from '../common'
import { IRazzleList, IRazzleListItem } from '../internal/list'
import { RazzleWidget } from './razzle-widget'

interface RazzleListProps {
  title?: string
  items: RazzleListItemProps[]
}

interface RazzleListItemProps {
  text: string
  onSelect?: IActionTrigger
  actions?: IActionTrigger[]
}

/**
 * A list widget. A list widget is a widget that can contain a list of items.
 */
export class RazzleList extends RazzleWidget {
  children?: RazzleWidget[] | undefined = undefined
  title?: string
  items: RazzleListItem[]

  constructor(props: RazzleListProps) {
    super()
    this.title = props.title
    this.items = props.items.map((item) => new RazzleListItem(item))
  }

  getType(): RazzleWidgetType {
    return 'list'
  }

  toJSON(): IRazzleList {
    return {
      type: this.getType(),
      children: this.children?.map((child) => child.toJSON()),
      title: this.title,
      items: this.items.map((it) => it.toJSON()),
    }
  }
}

/**
 * A list item widget. A list item widget is a widget that can be used to display a row in a [[RazzleList]].
 * A row can contain a text, an action to be triggered when the row is selected or a list of actions that can be triggered displayed as links.
 */
export class RazzleListItem extends RazzleWidget {
  children?: RazzleWidget[] | undefined = undefined  
  text: string
  onSelect?: IActionTrigger
  actions?: IActionTrigger[]

  constructor(props: RazzleListItemProps) {
    super()
    this.text = props.text
    this.onSelect = props.onSelect
    this.actions = props.actions
  }

  getType(): RazzleWidgetType {
    return 'list-item'
  }

  toJSON(): IRazzleListItem {
    return {      
      type: this.getType(),
      text: this.text,      
      onSelect: this.onSelect,
      actions: this.actions,
    }
  }
}
