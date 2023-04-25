import {
  CrossAxisAlignment,
  IRazzleColumn,
  IRazzleRow,
  MainAxisAlignment,
} from '@razzledotai/widgets'
import { renderResponseWidget } from '../utils/render-reponse'
import { v4 as uuidv4 } from 'uuid'
import { Fragment } from 'react'

export interface RowProps {
  row: IRazzleRow
}

export function Row(props: RowProps) {
  const { children } = props.row
  const flexClasses = buildFlexClasses(
    props.row.mainAxisAlignment,
    props.row.crossAxisAlignment
  )

  const hasSpacing = props.row.spacing !== undefined && props.row.spacing > 0
  const spacingStyle = {
    width: `${props.row.spacing}px`,
  }

  return (
    <div className={`flex flex-row w-full ${flexClasses}`}>
      {children.map((child, index) => {
        if (index !== 0 && hasSpacing) {
          return (
            <Fragment key={`row-${uuidv4()}`}>
              <span style={spacingStyle}></span>
              {renderResponseWidget(child, uuidv4())}
            </Fragment>
          )
        }

        return renderResponseWidget(child, uuidv4())
      })}
    </div>
  )
}

function buildFlexClasses(
  mainAxisAlignment: MainAxisAlignment,
  crossAxisAlignment: CrossAxisAlignment
) {
  let extraClasses = ''
  switch (mainAxisAlignment) {
    case 'center':
      extraClasses += ' justify-center'
      break
    case 'start':
      extraClasses += ' justify-start'
      break
    case 'end':
      extraClasses += ' justify-end'
      break
  }

  switch (crossAxisAlignment) {
    case 'center':
      extraClasses += ' items-center'
      break
    case 'start':
      extraClasses += ' items-start'
      break
    case 'end':
      extraClasses += ' items-end'
      break
  }

  return extraClasses
}

export interface ColumnProps {
  column: IRazzleColumn
}

export function Column(props: ColumnProps) {
  const { children } = props.column
  const flexClasses = buildFlexClasses(
    props.column.mainAxisAlignment,
    props.column.crossAxisAlignment
  )
  const hasSpacing =
    props.column.spacing !== undefined && props.column.spacing > 0
  const spacingStyle = {
    height: `${props.column.spacing}px`,
  }

  return (
    <div className={'flex flex-col w-full ' + flexClasses}>
      {children.map((child, index) => {
        if (index !== 0 && hasSpacing) {
          return (
            <Fragment key={`col-${uuidv4()}`}>
              <span style={spacingStyle}></span>
              {renderResponseWidget(child, `col-${uuidv4()}`)}
            </Fragment>
          )
        }

        return renderResponseWidget(child, `col-${uuidv4()}`)
      })}
    </div>
  )
}
