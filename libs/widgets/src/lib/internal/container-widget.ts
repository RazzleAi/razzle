import { IRazzleWidget } from './razzle-widget'

export interface IRazzleContainerWidget extends IRazzleWidget {
    children: IRazzleWidget[]
}
