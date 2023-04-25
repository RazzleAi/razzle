import { RazzleWidgetType } from '../common'
import {
  IRazzleCustomTable,
  IRazzleCustomTableCell,
  IRazzleCustomTableColumn,
  IRazzleCustomTableRow,
} from '../internal'
import { RazzleWidget } from './razzle-widget'
import { v4 as uuid } from 'uuid'

/**
 * Constructor options for a [[RazzleCustomTable]].
 */
export interface RazzleCustomTableProps {
  /**
   * The title of the table.
   */
  title?: string
  /**
   * The columns of the table.
   */  
  columns: RazzleCustomTableColumnProps[]
  /**
   * Builder function that returns a widget for each cell in the table.
   * @param rowIdx The index of the row.
   * @param colID The ID of the column.
   * @param value The value of the cell.
   * @returns A widget to be displayed in the cell.
   */
  builder: (rowIdx: number, colID: string, value: unknown) => RazzleWidget
  /**
   * The data to be displayed in the table.
   */
  data: unknown[][]
}

/**
 * A custom table widget. A custom table widget is a widget that can be used to display a table.
 * A **RazzleCustomTable** differs from a [[RazzleTable]] in that it allows you to customize the content of each cell.
 * example:
 * ```ts
 *   const pagination = callDetails.pagination
 *   let companies = this.expenseManagerService.listCompanies()
 *   const totalCount = companies.length
 *   const { pageNumber, pageSize } = pagination || {
 *     pageNumber: 1,
 *     pageSize: 10,
 *   }
 *   companies = companies.slice(
 *     (pageNumber - 1) * pageSize,
 *     pageNumber * pageSize
 *   )
 *   const data: unknown[][] = companies.map((company) => [
 *     ...Object.values(company),
 *     '',
 *     '',
 *   ])
 *   return new RazzleResponse({
 *     pagination: {
 *       pageNumber,
 *       pageSize,
 *       totalCount,
 *     },
 *     ui: new RazzleCustomTable({
 *       columns: [
 *         {
 *           id: 'id',
 *           header: 'ID',
 *         },
 *         {
 *           id: 'name',
 *           header: 'Name',
 *           widthPct: 50,
 *         },
 *         {
 *           id: 'actionManage',
 *           header: '',
 *         },
 *         {
 *           id: 'actionListCards',
 *           header: '',
 *         },
 *       ],
 *       data,
 *       builder: (rowIdx: number, colId: string, value: unknown) => {
 *         const company = companies[rowIdx]
 *         switch (colId) {
 *           case 'actionManage':
 *             return new RazzleLink({
 *               textSize: 'small',
 *               action: {
 *                 action: 'getCompany',
 *                 label: 'Manage',
 *                 args: [company.id],
 *               },
 *             })
 *           case 'actionListCards':
 *             return new RazzleLink({
 *               textSize: 'small',
 *               action: {
 *                 action: 'listCardsByCompany',
 *                 label: 'List cards',
 *                 args: [company.id],
 *               },
 *             })
 *           default:
 *             return new RazzleText({ text: value as string })
 *         }
 *       },
 *     }),
 *   })
 * ```
 * 
 */
export class RazzleCustomTable extends RazzleWidget {
  id?: string
  children: RazzleWidget[] | undefined = undefined
  /**
   * The title of the table
   */
  title?: string  
  columns: RazzleCustomTableColumn[]
  /**
   * For internal use only. Use the builder function instead
   */
  rows: RazzleCustomTableRow[]
  /**
   * The data to display in the table
   */
  data: unknown[][]
  /**
   * A function that builds the content of each cell
   * @param rowIdx The index of the row
   * @param colID The ID of the column
   * @param value The value of the cell
   * @returns A widget that will be displayed in the cell
   */
  builder: (rowIdx: number, colID: string, value: unknown) => RazzleWidget

  constructor(props: RazzleCustomTableProps) {
    super()
    this.id = uuid()
    this.title = props.title
    this.columns = props.columns.map(
      (column) => new RazzleCustomTableColumn(column)
    )
    this.builder = props.builder
    this.data = props.data
    this.rows = this.data.map((row, rowIdx) => {
      const cells = row.map((value, colIdx) => {
        const column = this.columns[colIdx]
        const widget = this.builder(rowIdx, column.id, value)
        return new RazzleCustomTableCell({
          id: column.id,
          widget,
        })
      })
      return new RazzleCustomTableRow({ cells })
    })
  }

  getType(): RazzleWidgetType {
    return 'custom-table'
  }

  toJSON(): IRazzleCustomTable {
    return {
      type: this.getType(),
      title: this.title,
      columns: this.columns.map((column) => column.toJSON()),
      rows: this.rows.map((row) => row.toJSON()),
    }
  }
}

export interface RazzleCustomTableColumnProps {
  /**
   * The ID of the column. This ID will be used to identify the column in the builder function.
   */
  id: string
  /**
   * The header of the column. This will be displayed in the header of the table on the UI.
   */
  header: string
  /**
   * The width of the column in percentage. If not specified, the column will be automatically sized.
   */
  widthPct?: number
}

export class RazzleCustomTableColumn extends RazzleWidget {
  children: RazzleWidget[] | undefined = undefined
  id: string
  header: string
  widthPct?: number

  constructor(props: RazzleCustomTableColumnProps) {
    super()
    this.id = props.id
    this.header = props.header
    this.widthPct = props.widthPct
  }

  getType(): RazzleWidgetType {
    return 'custom-table-column'
  }

  toJSON(): IRazzleCustomTableColumn {
    return {
      type: this.getType(),
      header: this.header,
      widthPct: this.widthPct,
      id: this.id,
    }
  }
}

export interface RazzleCustomTableRowProps {
  cells: RazzleCustomTableCellProps[]
}

export class RazzleCustomTableRow extends RazzleWidget {
  children: RazzleWidget[] | undefined = undefined
  cells: RazzleCustomTableCell[]

  constructor(props: RazzleCustomTableRowProps) {
    super()
    this.cells = props.cells.map((cell) => new RazzleCustomTableCell(cell))
  }

  getType(): RazzleWidgetType {
    return 'custom-table-row'
  }

  toJSON(): IRazzleCustomTableRow {
    return {
      type: this.getType(),
      cells: this.cells.map((cell) => cell.toJSON()),
    }
  }
}

export interface RazzleCustomTableCellProps {
  id: string
  widget: RazzleWidget
}

export class RazzleCustomTableCell extends RazzleWidget {
  children: RazzleWidget[] | undefined = undefined
  id: string
  widget: RazzleWidget

  constructor(props: RazzleCustomTableCellProps) {
    super()
    this.id = props.id
    this.widget = props.widget
  }

  getType(): RazzleWidgetType {
    return 'custom-table-cell'
  }

  toJSON(): IRazzleCustomTableCell {
    return {
      type: this.getType(),
      id: this.id,
      widget: this.widget.toJSON(),
    }
  }
}
