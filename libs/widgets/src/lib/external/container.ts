import { RazzleWidgetType, WidgetPadding } from '../common'
import { IRazzleContainer } from '../internal/container'
import { RazzleColumn } from './column'
import { RazzleContainerWidget } from './container-widget'
import { RazzleWidget } from './razzle-widget'
import { RazzleRow } from './row'

export interface RazzleContainerProps {
  body: RazzleRow | RazzleColumn
  padding?: WidgetPadding
  title?: string
}

export interface RazzleContainerWithChildProps {
  child: RazzleWidget
  padding?: WidgetPadding
  title?: string
}

/**
 * A container widget. that can contain a single child widget. The child of a container widget can only be a [[RazzleRow]] or a [[RazzleColumn]].
 * example:
 * ```ts
 * ...
 *   new RazzleContainer({
 *     padding: WidgetPadding.symmetric({
 *       horizontal: 10,
 *       vertical: 5,
 *     }),
 *     body: new RazzleRow({
 *       mainAxisAlignment: 'start',
 *       crossAxisAlignment: 'center',
 *       children: [
 *         new RazzleImage({
 *           url: user.profilePictureUrl,
 *           circular: true,
 *         }),
 *         new RazzleText({
 *           text: user.username,
 *           textSize: 'small',
 *           padding: WidgetPadding.symmetric({
 *             vertical: 10,
 *             horizontal: 10,
 *           }),
 *         }),
 *       ],
 *     }),
 *   }),
 * ...
 * ```
 */
export class RazzleContainer extends RazzleContainerWidget {  
  children: RazzleWidget[]
  /**
   * The child of a container widget can only be a [[RazzleRow]] or a [[RazzleColumn]].
   */
  body: RazzleRow | RazzleColumn

  /**
   * The padding of the container widget.
   */
  padding: WidgetPadding

  /**
   * The title of the container widget.
   */
  title?: string

  constructor(props: RazzleContainerProps) {
    super()
    this.body = props.body
    this.children = [this.body]
    this.padding = props.padding || new WidgetPadding({})
    this.title = props.title
  }

  static withChild(props: RazzleContainerWithChildProps): RazzleContainer {
    return new RazzleContainer({
      title: props.title,
      padding: props.padding,
      body: new RazzleRow({
        mainAxisAlignment: 'center',
        crossAxisAlignment: 'center',
        children: [props.child],
      }),
    })
  }

  getType(): RazzleWidgetType {
    return 'container'
  }

  toJSON(): IRazzleContainer {
    return {
      type: this.getType(),
      children: this.children.map((c) => c.toJSON()),
      padding: this.padding?.toJSON(),
      title: this.title,
    }
  }
}
