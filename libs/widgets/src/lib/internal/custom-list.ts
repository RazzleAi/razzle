import { IRazzleWidget } from './razzle-widget'

export interface IRazzleCustomList extends IRazzleWidget {
  title?: string
  children?: IRazzleWidget[] | undefined
  items: IRazzleCustomListItem[]
  divider?: boolean
}

export interface IRazzleCustomListItem extends IRazzleWidget {
  content: IRazzleWidget
}
