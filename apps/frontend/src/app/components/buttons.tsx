import { ReactNode } from 'react'
import { Spinner } from './spinners'

export interface PrimaryButtonProps {
  text: string
  isLoading?: boolean
  icon?: ReactNode
  type?: 'submit' | 'button'
  short?: boolean
  tall?: boolean
  fullWidth?: boolean
  disabled?: boolean
  onClick?: () => void
}

export interface OutlineButtonProps extends PrimaryButtonProps {
  staticColor?: boolean
}

export function PrimaryButton(props: PrimaryButtonProps) {
  return (
    <button
      onClick={props.onClick}
      type={props.type ?? 'button'}
      disabled={props.disabled}
      className={
        'inline-flex w-full justify-center rounded border border-transparent bg-electricIndigo-500 text-base font-medium text-white shadow-sm hover:bg-electricIndigo-600 focus:outline-none focus:ring-2 focus:ring-electricIndigo-500 focus:ring-offset-2 transition-colors duration-300 sm:text-sm disabled:opacity-70 disabled:hover:bg-electricIndigo-500 disabled:hover:opacity-70' +
        (props.fullWidth ?? false ? ' w-full' : ' sm:w-auto') +
        (props.short ?? false ? ' px-2 py-1' : ' px-4 py-2') +
        (props.tall ?? false ? ' h-[50px] items-center justify-center' : '')
      }
    >
      {props.isLoading ? (
        <Spinner size="small" thumbColorClass="fill-electricIndigo-500" />
      ) : (
        props.text
      )}
    </button>
  )
}

export function PrimaryOutlineButton(props: OutlineButtonProps) {
  return (
    <button
      type={props.type ?? 'button'}
      onClick={props.onClick}
      disabled={props.disabled}
      className={
        'inline-flex w-full justify-center rounded border border-gray-300  bg-transparent text-base font-medium text-gray-600  shadow-sm focus:outline-none focus:ring-2 focus:ring-electricIndigo-500 focus:ring-offset-2 sm:text-sm transition-colors duration-300 disabled:opacity-70 disabled:hover:text-gray-600 disabled:hover:border-gray-300 disabled:hover:opacity-70 items-center' +
        (props.fullWidth ?? false ? ' w-full' : ' sm:w-auto') +
        (props.short ?? false ? ' px-2 py-1' : ' px-4 py-2') +
        (props.tall ?? false ? ' h-[50px] items-center justify-center' : '') +
        (props.staticColor ?? false
          ? ' border-electricIndigo-500 text-electricIndigo-500 '
          : ' hover:border-electricIndigo-500 hover:text-electricIndigo-500 ')
      }
    >
      {props.isLoading ? (
        <Spinner size="small" thumbColorClass="fill-electricIndigo-500" />
      ) : (
        props.text
      )}
    </button>
  )
}

export function DangerOutlineButton(props: OutlineButtonProps) {
  return (
    <button
      type={props.type ?? 'button'}
      onClick={props.onClick}
      disabled={props.disabled}
      className={
        'inline-flex w-full justify-center rounded border border-gray-300 bg-transparent text-base font-medium text-gray-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 sm:text-sm transition-colors duration-300 disabled:opacity-70 disabled:hover:text-gray-600 disabled:hover:border-gray-300 disabled:hover:opacity-70 ' +
        (props.fullWidth ?? false ? ' w-full' : ' sm:w-auto') +
        (props.short ?? false ? ' px-2 py-1' : ' px-4 py-2') +
        (props.tall ?? false ? ' h-[50px] items-center justify-center' : '') +
        (props.staticColor ?? false
          ? ' border-red-500 text-red-500 '
          : ' hover:border-red-500 hover:text-red-500 ')
      }
    >
      {props.isLoading ? (
        <Spinner size="small" thumbColorClass="fill-red-500" />
      ) : (
        props.text
      )}
    </button>
  )
}
