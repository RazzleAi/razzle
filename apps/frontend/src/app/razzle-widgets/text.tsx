import { IRazzleText } from '@razzle/widgets'
import { buildPaddingStyles, buildTextSizeClasses, buildTextWeightClasses } from './helpers'

interface TextProps {
  text: IRazzleText
}

export function Text(props: TextProps) {
  const { padding, text, textSize, textColor, textWeight } = props.text
  const paddingStyles = buildPaddingStyles(padding)
  const textSizeClasses = buildTextSizeClasses(textSize)
  const textWeightClasses = buildTextWeightClasses(textWeight)

  const allStyles = { ...paddingStyles }
  return (
    <p className={` ${textSizeClasses} ${textWeightClasses}`} style={allStyles}>
      {text}
    </p>
  )
}
