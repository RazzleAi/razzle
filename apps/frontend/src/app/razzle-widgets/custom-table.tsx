import {
  IRazzleCustomTable,
  IRazzleCustomTableCell,
  IRazzleCustomTableRow,
} from '@razzledotai/widgets'
import { useFirebaseServices } from '../firebase'
import { useMessageDetails } from '../screens/workspaces/center-pane/history-item-view'
import { useAppStore } from '../stores/app-store'
import { renderResponseWidget } from '../utils/render-reponse'

export interface CustomTableProps {
  table: IRazzleCustomTable
}

export function CustomTable(props: CustomTableProps) {
  const { columns, rows, title } = props.table
  const { appName, appDescription, applicationId } = useMessageDetails()
  const { me } = useAppStore()
  const { currentUser } = useFirebaseServices()

  let fixedWidths = false
  const columnIdIndexes = new Map<string, number>()
  columns.forEach((column, index) => {
    if (column.widthPct !== undefined && column.widthPct !== 0) {
      fixedWidths = true
    }

    columnIdIndexes.set(column.id, index)
  })

  const sortedRows: IRazzleCustomTableRow[] = []
  for (const row of rows) {
    const cells = row.cells
    const sortedCells: IRazzleCustomTableCell[] = new Array(
      columnIdIndexes.size
    )

    for (const cell of cells) {
      if (!cell) {
        continue
      }
      const index = columnIdIndexes.get(cell.id)
      if (index !== undefined) {
        sortedCells[index] = cell
      }
    }

    row.cells = sortedCells
    sortedRows.push(row)
  }
  
  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5">
      {title ? <TableTitle title={title} /> : undefined}
      <table
        className={`w-full divide-y divide-gray-300 ${
          fixedWidths ? 'table-fixed' : ''
        }`}
      >
        <thead className="bg-gray-50">
          <tr className="divide-x divide-gray-200">
            {columns.map((column, index) => {
              const colWidth =
                fixedWidths && column.widthPct ? column.widthPct : undefined
              return (
                <th
                  key={`column-header-${index}`}
                  scope="col"
                  style={{ width: colWidth ? `${colWidth}%` : undefined }}
                  className="py-3.5 pl-4 pr-4 text-left text-sm font-semibold text-gray-900"
                >
                  {column.header}
                </th>
              )
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {sortedRows.map((row, index) => {
            return (
              <tr key={`row-${index}`} className="divide-x divide-gray-200">
                {row.cells.map((cell, index) => {
                  return (
                    <td
                      key={`row-cell-${index}`}
                      className="whitespace-nowrap overflow-x-scroll py-2 pl-2 pr-2 text-sm font-medium text-gray-900"
                    >
                      {renderResponseWidget(cell.widget)}
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

function TableTitle(props: { title: string }) {
  return (
    <div className="flex px-6 py-3 text-sm bg-gray-100 font-semibold border-b">
      {props.title}
    </div>
  )
}
