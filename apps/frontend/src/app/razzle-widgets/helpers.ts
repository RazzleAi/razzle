import {
  IWidgetPadding,
  RazzleTextSize,
  RazzleTextWeight,
} from '@razzle/widgets'

export function buildPaddingStyles(
  padding: IWidgetPadding | undefined,
  optionalDefault?: IWidgetPadding | undefined
): object | undefined {
  const paddingStyle = padding ? {} : undefined
  if (!paddingStyle) {
    return {
      paddingTop: `${optionalDefault?.top || 0}px`,
      paddingRight: `${optionalDefault?.right || 0}px`,
      paddingBottom: `${optionalDefault?.bottom || 0}px`,
      paddingLeft: `${optionalDefault?.left || 0}px`,
    }
  }

  if (padding.top && padding.top > 0) {
    paddingStyle['paddingTop'] = `${padding.top}px`
  }

  if (padding.right && padding.right > 0) {
    paddingStyle['paddingRight'] = `${padding.right}px`
  }

  if (padding.bottom && padding.bottom > 0) {
    paddingStyle['paddingBottom'] = `${padding.bottom}px`
  }

  if (padding.left && padding.left > 0) {
    paddingStyle['paddingLeft'] = `${padding.left}px`
  }

  return paddingStyle
}

export function buildTextSizeClasses(
  textSize?: RazzleTextSize | undefined,
  optionalDefault?: RazzleTextSize | undefined
) {
  switch (textSize) {
    case 'xlarge':
      return 'text-xl'
    case 'large':
      return 'text-lg'
    case 'medium':
      return 'text-base'
    case 'small':
      return 'text-sm'
    case 'xsmall':
      return 'text-xs'
    default:
      return optionalDefault
        ? buildTextSizeClasses(optionalDefault)
        : 'text-base'
  }
}

export function buildTextWeightClasses(
  textWeight?: RazzleTextWeight,
  optionalDefault?: RazzleTextWeight
) {
  switch (textWeight) {
    case 'light':
      return 'font-light'
    case 'normal':
      return 'font-normal'
    case 'medium':
      return 'font-medium'
    case 'semibold':
      return 'font-semibold'
    case 'bold':
      return 'font-bold'
    default:
      return optionalDefault
        ? buildTextWeightClasses(optionalDefault)
        : 'font-normal'
  }
}
