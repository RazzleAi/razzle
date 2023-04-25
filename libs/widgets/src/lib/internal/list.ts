import { IActionTrigger } from '../common'
import { IRazzleWidget } from './razzle-widget'

export interface IRazzleList extends IRazzleWidget {
  children?: IRazzleWidget[] | undefined
  title?: string
  items?: IRazzleListItem[]
}

export interface IRazzleListItem extends IRazzleWidget {
  text: string
  onSelect?: IActionTrigger
  actions?: IActionTrigger[]
}