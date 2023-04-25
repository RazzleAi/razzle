import { HiInformationCircle } from 'react-icons/hi'
import { Alert } from 'flowbite-react'
import { useEffect, useState } from 'react'

export function SuccessDisplay(props: {
  show: boolean
  title?: string
  message?: string
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
      color="success"
      onDismiss={() => {
        setShow(false)
      }}
      className="mb-3"
      icon={HiInformationCircle}
    >
      <span className="flex flex-col">
        <span className="font-semibold">{props.title ?? ''}</span>
        <span className="font-normal">{props.message ?? ''}</span>
      </span>
    </Alert>
  ) : undefined
}
