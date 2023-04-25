import { RazzleWidgetType } from '../common'
import { IRazzleCustomList, IRazzleCustomListItem } from '../internal'
import { RazzleContainer } from './container'
import { RazzleWidget } from './razzle-widget'
import { RazzleRow } from './row'

interface RazzleCustomListProps {
  title?: string
  items: RazzleCustomListItem[]
  divider?: boolean
}

interface RazzleCustomListItemProps {
  content: RazzleWidget
}

/**
 * A custom list widget. A custom list widget is a list of widgets that can be used to display a list of items.
 * A **RazzleCustomList** is different from a [[RazzleList]] in that it can be used to show any widget as an item (via a [[RazzleCustomListItem]]) whereas a [[RazzleList]] can only contain text.
 * example:
 * ```ts
 * ...
 * ui: new RazzleCustomList({
 *       title: 'Users in Account',
 *       items: usersInAccount.map(
 *         (user) =>
 *           new RazzleCustomListItem({
 *             content: new RazzleContainer({
 *               padding: new WidgetPadding({ bottom: 10 }),
 *               body: new RazzleColumn({
 *                 children: [
 *                   new RazzleContainer({
 *                     padding: WidgetPadding.symmetric({
 *                       horizontal: 10,
 *                       vertical: 5,
 *                     }),
 *                     body: new RazzleRow({
 *                       mainAxisAlignment: 'start',
 *                       crossAxisAlignment: 'center',
 *                       children: [
 *                         new RazzleImage({
 *                           url: user.profilePictureUrl,
 *                           circular: true,
 *                         }),
 *                         new RazzleText({
 *                           text: user.username,
 *                           textSize: 'small',
 *                           padding: WidgetPadding.symmetric({
 *                             vertical: 10,
 *                             horizontal: 10,
 *                           }),
 *                         }),
 *                       ],
 *                     }),
 *                   }),
 *                   user.id !== accountOwner.id
 *                     ? new RazzleContainer({
 *                         padding: WidgetPadding.symmetric({ horizontal: 10 }),
 *                         body: new RazzleRow({
 *                           children: [
 *                             new RazzleLink({
 *                               action: {
 *                                 label: 'Remove',
 *                                 action: 'removeUserFromAccount',
 *                                 args: [user.id],
 *                               },
 *                               textSize: 'xsmall',
 *                             }),
 *                           ],
 *                         }),
 *                       })
 *                     : new RazzleRow({ children: [] }),
 *                 ],
 *               }),
 *             }),
 *           })
 *       ),
 *     }),
 * ...
 * ```
 * 
 */
export class RazzleCustomList extends RazzleWidget {
  children?: RazzleWidget[] | undefined = undefined
  /**
   * The title of the list.
   */
  title?: string
  /**
   * The items of the list.
   */
  items: RazzleCustomListItem[]
  /**
   * Whether to show a divider between each item.
   */
  divider?: boolean

  constructor(props: RazzleCustomListProps) {
    super()
    this.title = props.title
    this.items = props.items
    this.divider = props.divider === undefined ? true : props.divider
  }

  getType(): RazzleWidgetType {
    return 'custom-list'
  }

  toJSON(): IRazzleCustomList {
    return {
      type: this.getType(),
      children: this.children?.map((child) => child.toJSON()),
      title: this.title,
      items: this.items.map((it) => it.toJSON()),
      divider: this.divider,
    }
  }
}

/**
 * A custom list item widget. A custom list item widget is a widget that can be used to display a row in a [[RazzleCustomList]].
 * 
 */
export class RazzleCustomListItem extends RazzleWidget {
  children?: RazzleWidget[] | undefined = undefined
  /**
   * The content of the list item.
   */
  content: RazzleWidget

  constructor(props: RazzleCustomListItemProps) {
    super()
    this.content = new RazzleContainer({
      body: new RazzleRow({
        children: [props.content],
      }),
    })
  }

  getType(): RazzleWidgetType {
    return 'custom-list-item'
  }

  toJSON(): IRazzleCustomListItem {
    return {
      type: this.getType(),
      children: this.children?.map((child) => child.toJSON()),
      content: this.content.toJSON(),
    }
  }
}
