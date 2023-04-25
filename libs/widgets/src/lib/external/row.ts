import {
  CrossAxisAlignment,
  MainAxisAlignment,
  RazzleWidgetType,
} from '../common'
import { IRazzleRow } from '../internal'

import { RazzleContainerWidget } from './container-widget'
import { RazzleWidget } from './razzle-widget'
import * as _ from 'lodash'

export interface RazzleRowProps {
  children: RazzleWidget[]
  mainAxisAlignment?: MainAxisAlignment
  crossAxisAlignment?: CrossAxisAlignment
  spacing?: number
}

/**
 * Renders a row of widgets.
 * example:
 * ```ts
 * ...
 * body: new RazzleRow({
 *     children: [
 *       new RazzleText({ text: `Deactivated card ${card.cardNumber}` }),
 *       new RazzleText({ text: `Card Status: ${card.active}` }),
 *     ],
 *   }),
 * ...
 * ```
 *
 */
export class RazzleRow extends RazzleContainerWidget {
  /**
   * The widgets to render in the row.
   */
  children: RazzleWidget[]
  /**
   * The main axis alignment of the row.
   * @default 'start'
   * @see [[MainAxisAlignment]]
   */
  mainAxisAlignment?: MainAxisAlignment
  /**
   * The cross axis alignment of the row.
   * @default 'start'
   * @see [[CrossAxisAlignment]]
   */
  crossAxisAlignment?: CrossAxisAlignment
  /**
   * The spacing between the widgets in the row.
   * @default 0
   */
  spacing?: number

  constructor(props: RazzleRowProps) {
    super()
    this.children = props.children
    this.mainAxisAlignment = props.mainAxisAlignment || 'start'
    this.crossAxisAlignment = props.crossAxisAlignment || 'start'
    this.spacing = props.spacing || 0
  }

  getType(): RazzleWidgetType {
    return 'row'
  }

  toJSON(): IRazzleRow {
    return {
      type: this.getType(),
      children: this.children?.map((c) => c.toJSON()),
      mainAxisAlignment: this.mainAxisAlignment,
      crossAxisAlignment: this.crossAxisAlignment,
      spacing: this.spacing,
    }
  }
}
