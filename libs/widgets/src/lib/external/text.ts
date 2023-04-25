import { RazzleTextSize, RazzleTextWeight, WidgetPadding } from '../common'
import { RazzleWidgetType } from '../common/widget-type'
import { IRazzleText } from '../internal/text'
import { RazzleWidget } from './razzle-widget'


export interface RazzleTextProps {
  text: string
  padding?: WidgetPadding
  textSize?: RazzleTextSize
  textColor?: string
  textWeight?: RazzleTextWeight
}

/**
 * A text widget. A text widget is a widget that displays text.
 */
export class RazzleText extends RazzleWidget {
  readonly children = undefined
  /**
   * Padding of the widget.
   */
  padding?: WidgetPadding
  /**
   * The text to display.
   */
  text: string
  /**
   * The size of the text.
   * @default 'medium'
   * @see {@link RazzleTextSize}
   */
  textSize?: RazzleTextSize
  /**
   * The color of the text.
   */
  textColor?: string
  /**
   * The weight of the text.
   * @see {@link RazzleTextWeight}
   * @default 'normal'
   */
  textWeight?: RazzleTextWeight
  
  getType(): RazzleWidgetType {
    return 'text'
  }

  constructor(props: RazzleTextProps) {
    super()
    this.text = props.text
    this.padding = props.padding || WidgetPadding.all(5)
    this.textSize = props.textSize || 'medium'
    this.textColor = props.textColor
    this.textWeight = props.textWeight || 'normal'
  }

  toJSON(): IRazzleText {
    return {
      type: this.getType(),
      text: this.text,
      padding: this.padding?.toJSON(),
      textSize: this.textSize,
      textColor: this.textColor,
      textWeight: this.textWeight,
    }
  }
}
