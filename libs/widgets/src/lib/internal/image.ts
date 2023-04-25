import { IRazzleWidget } from './razzle-widget'

export interface IRazzleImage extends IRazzleWidget {
  url: string
  altText?: string
  aspectRatio?: string
  width?: number
  height?: number
  circular?: boolean
  tooltip?: string
}
