import { IRazzleContainer } from '@razzledotai/widgets'
import { renderResponseWidget } from '../utils/render-reponse'
import { buildPaddingStyles } from './helpers'

export interface ContainerProps {
  container: IRazzleContainer
}
export function Container(props: ContainerProps) {
  const { container } = props
  const { padding, children } = container

  const paddingStyles = buildPaddingStyles(padding)

  return (
    <div style={paddingStyles}>
      {children.map((child, index) => {
        return renderResponseWidget(child, index)
      })}
    </div>
  )
}
