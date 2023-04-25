import {
  CrossAxisAlignment,
  MainAxisAlignment,
  RazzleWidgetType,
} from '../common'
import { IRazzleColumn } from '../internal'
import { RazzleContainerWidget } from './container-widget'
import { RazzleWidget } from './razzle-widget'

/**
 * Properties for a column widget.
 * @see [[RazzleColumn]]
 */
export interface RazzleColumnProps {
  /**
   * The widgets to render in the column.
   */
  children: RazzleWidget[]

  /**
   * The main axis alignment of the column. 
   * @default 'start'
   * @see [[MainAxisAlignment]]
   * 
   */
  mainAxisAlignment?: MainAxisAlignment
  /**
   * The cross axis alignment of the column.
   * @default 'start'
   * @see [[CrossAxisAlignment]]
   */
  crossAxisAlignment?: CrossAxisAlignment
  spacing?: number
}

/**
 * Renders a column of widgets.
 * example:
 * ```ts
 * ...
 * new RazzleColumn({
 *    children: [
 *      new RazzleContainer({
 *        padding: WidgetPadding.symmetric({
 *          horizontal: 10,
 *          vertical: 5,
 *        }),
 *        body: new RazzleRow({
 *          mainAxisAlignment: 'start',
 *          crossAxisAlignment: 'center',
 *          children: [
 *            new RazzleImage({
 *              url: user.profilePictureUrl,
 *              circular: true,
 *            }),
 *            new RazzleText({
 *              text: user.username,
 *              textSize: 'small',
 *              padding: WidgetPadding.symmetric({
 *                vertical: 10,
 *                horizontal: 10,
 *              }),
 *            }),
 *          ],
 *        }),
 *      }),
 *      user.id !== accountOwner.id
 *        ? new RazzleContainer({
 *            padding: WidgetPadding.symmetric({ horizontal: 10 }),
 *            body: new RazzleRow({
 *              children: [
 *                new RazzleLink({
 *                  action: {
 *                    label: 'Remove',
 *                    action: 'removeUserFromAccount',
 *                    args: [user.id],
 *                  },
 *                  textSize: 'xsmall',
 *                }),
 *              ],
 *            }),
 *          })
 *        : new RazzleRow({ children: [] }),
 *    ],
 *  }),
 * ...
 * ```
 * 
 */
export class RazzleColumn extends RazzleContainerWidget {
  children: RazzleWidget[]
  private mainAxisAlignment?: MainAxisAlignment
  private crossAxisAlignment?: CrossAxisAlignment
  private spacing?: number

  constructor(props: RazzleColumnProps) {
    super()

    this.children = props.children
    this.mainAxisAlignment = props.mainAxisAlignment || 'start'
    this.crossAxisAlignment = props.crossAxisAlignment || 'start'
    this.spacing = props.spacing || 0
  }

  getType(): RazzleWidgetType {
    return 'column'
  }

  toJSON(): IRazzleColumn {
    return {
      type: this.getType(),
      children: this.children?.map((c) => c.toJSON()),
      mainAxisAlignment: this.mainAxisAlignment,
      crossAxisAlignment: this.crossAxisAlignment,
      spacing: this.spacing,
    }
  }
}
