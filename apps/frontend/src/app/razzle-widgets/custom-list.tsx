import { IRazzleCustomList } from '@razzle/widgets'
import { renderResponseWidget } from '../utils/render-reponse'
import {v4 as uuidv4} from 'uuid'
import { Fragment } from 'react'

export interface CustomListProps {
  list: IRazzleCustomList
}

export function CustomList(props: CustomListProps) {
  return (
    <div className="flex flex-col">
      {props.list.title && <ListTitle title={props.list.title} />}
      {props.list.items.map((item, index) => {
        if (
          index !== props.list.items.length - 1 &&
          props.list.divider === true
        ) {
          return (
            <Fragment key={uuidv4()}>
              {renderResponseWidget(item.content, uuidv4())}
              <div key={uuidv4()} className="w-full bg-[#E8EBED] h-[1px]"></div>
            </Fragment>
          )
        }
        return renderResponseWidget(item.content, uuidv4())
      })}
    </div>
  )
}

function ListTitle({ title }: { title: string }) {
  return (
    <div className="flex px-6 py-3 text-sm bg-gray-100 font-semibold border-b">
      {title}
    </div>
  )
}
