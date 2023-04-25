import { RazzleWidgetType } from '../common'
import { IRazzleImage } from '../internal'
import { RazzleWidget } from './razzle-widget'

export interface RazzleImageProps {
  url: string
  altText?: string
  aspectRatio?: string
  width?: number
  height?: number
  circular?: boolean
  tooltip?: string
}

/**
 * An image widget.
 * example:
 * ```ts
 * new RazzleImage({
 *     url: user.profilePictureUrl,
 *     circular: true,
 * })
 * ```
 */
export class RazzleImage extends RazzleWidget {
  readonly children = undefined
  /**
   * The url of the image.
   */
  readonly url: string
  /**
   * The alt text of the image.
   */
  readonly altText?: string
  /**
   * The aspect ratio of the image.
   */
  readonly aspectRatio?: string
  readonly width?: number
  readonly height?: number
  /**
   * Whether the image should be circular.
   */
  readonly circular?: boolean
  readonly tooltip?: string

  constructor(props: RazzleImageProps) {
    super()
    this.url = props.url
    this.altText = props.altText
    this.aspectRatio = props.aspectRatio
    this.width = props.width
    this.height = props.height
    this.circular = props.circular || false
    this.tooltip = props.tooltip
  }

  getType(): RazzleWidgetType {
    return 'image'
  }

  toJSON(): IRazzleImage {
    return {
      type: this.getType(),
      url: this.url,
      altText: this.altText,
      aspectRatio: this.aspectRatio,
      width: this.width,
      height: this.height,
      circular: this.circular,
      tooltip: this.tooltip,
    }
  }
}
