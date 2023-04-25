import { CrossAxisAlignment, MainAxisAlignment } from '../common'
import { IRazzleContainerWidget } from './container-widget'
import { IRazzleWidget } from './razzle-widget'

export interface IRazzleColumn extends IRazzleContainerWidget {
  children: IRazzleWidget[]
  mainAxisAlignment?: MainAxisAlignment
  crossAxisAlignment?: CrossAxisAlignment
  spacing?: number
}
