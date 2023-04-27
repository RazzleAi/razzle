import { Switch } from '@headlessui/react'
import { useState } from 'react'
import { classNames } from '../utils/classnames'

export interface PrimarySwitchProps {
  label?: string
  defaultValue?: boolean
  short?: boolean
  onChange?: (checked: boolean) => void
}

export function PrimarySwitch(props: PrimarySwitchProps) {
  const [enabled, setEnabled] = useState(props.defaultValue ?? false)
  return (
    <div className="flex flex-row gap-2 items-center">
      <Switch
        checked={enabled}
        onChange={(newVal) => {
          setEnabled(newVal)
          props.onChange?.(newVal)
        }}
        className={classNames(
          enabled ? 'bg-electricIndigo-600' : 'bg-gray-200',
          props.short ?? false
            ? 'relative inline-flex h-4 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-electricIndigo-600 focus:ring-offset-2'
            : 'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-electricIndigo-600 focus:ring-offset-2'
        )}
      >
        <span className="sr-only">{props.label}</span>
        <span
          aria-hidden="true"
          className={classNames(
            enabled ? 'translate-x-5' : 'translate-x-0',
            props.short ?? false
              ? 'pointer-events-none inline-block h-3 w-3 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
              : 'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out'
          )}
        />
      </Switch>
      {props.label && (
        <label htmlFor="offers" className="text-sm font-medium text-gray-700">
          Make this app available to everyone
        </label>
      )}
    </div>
  )
}
