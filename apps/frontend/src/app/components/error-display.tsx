import { HiInformationCircle } from 'react-icons/hi'
import { Alert } from 'flowbite-react'
import { useEffect, useState } from 'react'

export function ErrorDisplay(props: {
  isError: boolean
  title: string
  error?: unknown
}) {
  const [show, setShow] = useState<boolean>(false)
  useEffect(() => {
    if (props.isError === true && (props.error !== undefined || props.error !== null)) {
      setShow(true)
    } else {
      setShow(false)
    }
  }, [props.isError, props.error])

  return show ? (
    <Alert
      color="failure"
      onDismiss={() => {
        setShow(false)
      }}
      className="mb-3"
      icon={HiInformationCircle}
    >
      <span className="flex flex-col">
        <span className="font-semibold">{props.title}</span>
        <span className="font-normal">
          {(props.error as { message: string })?.message ?? undefined}
        </span>
      </span>
    </Alert>
  ) : (
    <></>
  )
}
