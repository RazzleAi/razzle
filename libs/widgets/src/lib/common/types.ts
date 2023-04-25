/**
 * MainAxisAlignment specifies how a row or column should align its children `along` the main axis.
 */
export type MainAxisAlignment = 'start' | 'center' | 'end'
/**
 * CrossAxisAlignment specifies how a row or column should align its children `across` the main axis.
 */
export type CrossAxisAlignment = 'start' | 'center' | 'end'

export interface IWidgetPadding {
  top?: number
  bottom?: number
  left?: number
  right?: number
}

/**
 * WidgetPadding specifies the padding of a widget.
 * example:
 * **To specify horizontal and vertical padding:**
 * ```ts
 * ...
 * padding: WidgetPadding.symmetric({ horizontal: 10, vertical: 5 }),
 * ...
 * ```
 *
 * **To specify all padding:**
 * ```ts
 * ...
 * padding: WidgetPadding.all(10),
 * ...
 * ```
 *
 * **To specify individual padding:**
 * ```ts
 * ...
 * padding: new WidgetPadding({ top: 10, bottom: 10, left: 10, right: 10 }),
 * ...
 * ```
 */
export class WidgetPadding {
  top?: number
  bottom?: number
  left?: number
  right?: number

  constructor(props: IWidgetPadding) {
    this.top = props.top || 0
    this.bottom = props.bottom || 0
    this.left = props.left || 0
    this.right = props.right || 0
  }

  static all(padding: number): WidgetPadding {
    return new WidgetPadding({
      top: padding,
      bottom: padding,
      left: padding,
      right: padding,
    })
  }

  static symmetric({
    vertical,
    horizontal,
  }: {
    vertical?: number
    horizontal?: number
  }): WidgetPadding {
    return new WidgetPadding({
      top: vertical,
      bottom: vertical,
      left: horizontal,
      right: horizontal,
    })
  }

  toJSON(): IWidgetPadding {
    return {
      top: this.top,
      bottom: this.bottom,
      left: this.left,
      right: this.right,
    }
  }
}

export type RazzleTextSize = 'xsmall' | 'small' | 'medium' | 'large' | 'xlarge'

export type RazzleTextWeight =
  | 'light'
  | 'normal'
  | 'medium'
  | 'semibold'
  | 'bold'
