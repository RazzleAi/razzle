import { useEffect, useState } from 'react'
import { textProperCase } from '../utils/text-proper-case'
import { useHotKeys } from '../hooks/useHotKey'
import { dateFromString } from '../screens/workspaces/center-pane/helpers'


export type FieldType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'date'
  | 'datetime'
  | 'select'

type FieldValueType = string | number | boolean | Date | string[]

interface ActionPaneFieldProps {
  argName: string
  argValue: string
  onChange: (argName: string, argValue: string) => void
  type: FieldType
}

export default function ActionPaneField(props: ActionPaneFieldProps) {
  const [value, setValue] = useState<FieldValueType>(undefined)
  useEffect(() => {
    setValue(getFieldValueType(props.type, props.argValue))
  }, [props.argValue, props.type])

  return (
    <div className="flex flex-row gap-3 w-full h-[30px] items-end mb-4 justify-start">
      <div className="flex text-md font-semibold">
        {textProperCase(props.argName)}:
      </div>
      {value !== undefined && (
        <ActionPaneInputField
          argName={props.argName}
          argValue={value}
          onChange={props.onChange}
          type={props.type}
        />
      )}
    </div>
  )
}

interface ActionPaneInputFieldProps {
  type: FieldType
  argName: string
  argValue: FieldValueType
  onChange: (argName: string, argValue: string) => void
}

function ActionPaneInputField(props: ActionPaneInputFieldProps) {
  const [isEditing, setIsEditing] = useState(props.argValue === null ? true : false)

  const onChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    props.onChange(props.argName, event.target.value)
  }

  return (
    <div className="flex gap-2">
      {isEditing ? (
        <InputField
          onChange={onChange}
          type={fieldTypeToInputType(props.type)}
          value={fieldValueTypeToString(props.argValue, props.type)}
          escape={() => setIsEditing(false)}
          onCancel={() => setIsEditing(false)}
        />
      ) : (
        <div className="text-md">{props.argValue?.toString()}</div>
      )}

      {!isEditing && (
        <button
          className="text-electricIndigo-600 font-medium text-sm"
          onClick={() => setIsEditing(true)}
        >
          Edit
        </button>
      )}
    </div>
  )
}

interface InputFieldProps {
  type: string
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  onCancel: () => void
  value: string
  escape: () => void
}

function InputField(inputProps: InputFieldProps) {
  // Gebnerate a unique id for the input field
  const id = Math.random().toString(36).substring(7)

  useHotKeys({
    key: 'Escape',
    componentName: 'ActionPaneField',
    includeMetaKey: false,
    callback: () => {
      inputProps.escape()
    },
    instanceId: id,
  })

  useHotKeys({
    key: 'Enter',
    componentName: 'ActionPaneField',
    includeMetaKey: false,
    callback: () => {
      inputProps.escape()
    },
    instanceId: id,
  })

  return (
    <div>
      <div className="flex flex-row gap-2">
        <input
          type={inputProps.type}
          value={inputProps.value}
          onChange={inputProps.onChange}
          className="flex w-full rounded-md p-1 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          placeholder="Enter here..."
        />
        <button
          className="text-electricIndigo-600 font-medium text-sm"
          onClick={inputProps.onCancel}
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

function getFieldValueType(fieldType: FieldType, value: string): FieldValueType {
  switch (fieldType) {
    case 'string':
      return value
    case 'number':
      return Number(value)
    case 'boolean':
      return value === 'true'
    case 'date': 
    case 'datetime':
      return dateFromString(value)      
  }
}

function fieldValueTypeToString(value: FieldValueType, type: FieldType): string {
  switch (type) {
    case 'string':
      return value as string
    case 'number':
      return value.toString()
    case 'boolean':
      return value.toString()
    case 'date':
    case 'datetime':
      return (value as Date).toISOString()
  }
}

function fieldTypeToInputType(fieldType: FieldType): string {
  switch (fieldType) {
    case 'string':
      return 'text'
    case 'number':
      return 'number'
    case 'boolean':
      return 'checkbox'
    case 'date':
      return 'date'
    case 'datetime':
      return 'datetime-local'
  }
}

