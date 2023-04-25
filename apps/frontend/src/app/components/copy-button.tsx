import { Tooltip } from 'flowbite-react'
import { AiOutlineCopy } from 'react-icons/ai'
import { useUiStore } from '../stores/ui-store'

export default function CopyBytton({
  text,
  tooltip,
  onClick,
}: {
  text: string
  tooltip?: string
  onClick?: () => void
}) {
  const { setToast, clearToast } = useUiStore()

  function showToast() {
    setToast('Item copied to clipboard')
    setTimeout(() => {
      clearToast()
    }, 2000)
  }

  return (
    <Tooltip
      placement="left"
      className="w-fit h-fit"
      content={tooltip ?? 'Copy'}
    >
      <button
        type="button"
        onClick={(e) => {
          if ('clipboard' in navigator) {
            navigator.clipboard.writeText(text)
          } else {
            document.execCommand('copy', true, text)
          }

          showToast()
          onClick?.()
        }}
      >
        <AiOutlineCopy size={22} className="text-gray-600" />
      </button>
    </Tooltip>
  )
}
