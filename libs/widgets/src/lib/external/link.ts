import {
  IActionTrigger,
  RazzleTextSize,
  RazzleTextWeight,
  RazzleWidgetType,
  WidgetPadding,
} from '../common'
import { IRazzleLink } from '../internal/link'
import { RazzleWidget } from './razzle-widget'

interface LinkProps {
  action: IActionTrigger
  padding?: WidgetPadding
  textSize?: RazzleTextSize
  textColor?: string
  textWeight?: RazzleTextWeight
}

/**
 * A link widget. A link widget is a clickable widget that can trigger an action or open a url.
 * example:
 * ```ts
 * ...
 * new RazzleLink({
 *     action: {
 *       label: 'Remove',
 *       action: 'removeUserFromAccount',
 *       args: [user.id],
 *     },
 *     textSize: 'xsmall',
 *   }),
 * ...
 * ```
 */
export class RazzleLink extends RazzleWidget {
  children?: RazzleWidget[] | undefined = undefined
  /**
   * Padding of the widget.
   * @see {@link WidgetPadding}
   */
  readonly padding?: WidgetPadding
  /**
   * The action to trigger when the link is clicked.
   * @see {@link IActionTrigger}
   */
  readonly action: IActionTrigger
  /**
   * The size of the text.
   * @see {@link RazzleTextSize}
   * @default 'medium'
   */
  readonly textSize?: RazzleTextSize
  /**
   * The color of the text.
   */
  readonly textColor?: string
  /**
   * The weight of the text.
   * @see {@link RazzleTextWeight}
   */
  readonly textWeight?: RazzleTextWeight

  constructor(props: LinkProps) {
    super()
    this.action = props.action
    this.padding = props.padding || WidgetPadding.all(5)
    this.textSize = props.textSize || 'medium'
    this.textColor = props.textColor
    this.textWeight = props.textWeight || 'normal'
  }

  getType(): RazzleWidgetType {
    return 'link'
  }

  toJSON(): IRazzleLink {
    return {
      type: this.getType(),
      action: this.action,
      textSize: this.textSize,
      textColor: this.textColor,
      textWeight: this.textWeight,
      padding: this.padding?.toJSON(),
    }
  }
}
