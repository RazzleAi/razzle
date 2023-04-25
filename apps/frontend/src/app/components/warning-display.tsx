import { Alert } from 'flowbite-react'
import { useEffect, useState } from 'react'
import { AiFillWarning } from 'react-icons/ai'

export function WarningDisplay(props: {
  show: boolean
  title?: string
  message?: string
  dismissable?: boolean
}) {
  const [show, setShow] = useState<boolean>(false)
  useEffect(() => {
    if (props.show) {
      setShow(true)
    } else {
      setShow(false)
    }
  }, [props.show])
  return show ? (
    <Alert
      color="warning"
      onDismiss={props.dismissable ? () => {
        setShow(false)
      } : undefined}
      className="mb-3"
      icon={AiFillWarning}
    >
      <span className="flex flex-col">
        <span className="font-semibold">{props.title}</span>
        <span className="font-normal">{props.message ?? ''}</span>
      </span>
    </Alert>
  ) : undefined
}
