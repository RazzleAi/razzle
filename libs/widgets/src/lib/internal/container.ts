import { IWidgetPadding } from '../common'
import { IRazzleContainerWidget } from './container-widget'

export interface IRazzleContainer extends IRazzleContainerWidget {  
  padding: IWidgetPadding
  title?: string
}
