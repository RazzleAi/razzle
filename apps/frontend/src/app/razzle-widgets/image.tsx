import { IRazzleImage } from '@razzledotai/widgets'

export interface ImageProps {
  image: IRazzleImage
}

export function Image(props: ImageProps) {
  const { url, altText, tooltip } = props.image
  const styles = buildImageStyles(props)
  return url && typeof url === 'string' ? (
    <img src={url} alt={altText} title={tooltip} style={styles} />
  ) : (
    <div style={styles} className="bg-gray-300"></div>
  )
}

function buildImageStyles(props: ImageProps) {
  const { aspectRatio, circular, width, height } = props.image
  const styles = {}
  if (aspectRatio) {
    styles['aspectRatio'] = `${aspectRatio}`
  }
  if (circular) {
    styles['borderRadius'] = '50%'
  } else {
    styles['borderRadius'] = '4px'
  }

  if (width) {
    styles['width'] = `${width}px`
  } else {
    styles['width'] = '50px'
  }
  if (height) {
    styles['height'] = `${height}px`
  } else {
    styles['height'] = '50px'
  }
  return styles
}
