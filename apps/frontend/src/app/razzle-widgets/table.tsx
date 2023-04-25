import { IRazzleTable } from '@razzledotai/widgets'
import { v4 as uuidv4 } from 'uuid'

export interface TableProps {
  table: IRazzleTable
}

export function Table(props: TableProps) {
  const { columns, data } = props.table

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5">
      <table className="min-w-full divide-y divide-gray-300">
        <thead className="bg-gray-50">
          <tr className="divide-x divide-gray-200">
            {columns.map((column, index) => {
              return (
                <th
                  key={`column-${uuidv4()}`}
                  scope="col"
                  className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900 sm:pl-6"
                >
                  {column.header}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {data.map((row, index) => {
            const rowData: string[] = Array.isArray(row)
              ? row
              : Object.values(row)
            return (
              <tr key={`row-${uuidv4()}`} className="divide-x divide-gray-200">
                {rowData.map((cell, index) => {
                  return (
                    <td key={`table-row-${uuidv4()}`} className="whitespace-nowrap py-4 pl-4 pr-4 text-sm font-medium text-gray-900 sm:pl-6">
                      {cell}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
