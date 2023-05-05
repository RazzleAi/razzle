import { RazzleWidgetType } from '../common'
import { IRazzleTable, IRazzleTableColumn } from '../internal'
import { RazzleWidget } from './razzle-widget'

export interface RazzleTableProps {
  columns: RazzleTableColumnProps[]
  data: string[][]
  showPagination?: boolean
}

export interface RazzleTableColumnProps {
  id: string
  header: string
  width?: number
}

export class RazzleTable extends RazzleWidget {
  children: RazzleWidget[] | undefined = undefined

  columns: RazzleTableColumn[]
  data: string[][]
  showPagination?: boolean

  constructor(props: RazzleTableProps) {
    super()

    if (props.data.length > 0 && props.columns.length !== props.data[0].length) {
      throw new Error('"data" must have the same number of columns "columns"')
    }

    this.columns = props.columns.map((column) => new RazzleTableColumn(column))
    this.data = props.data
    this.showPagination = props.showPagination || false
  }

  getType(): RazzleWidgetType {
    return 'table'
  }

  toJSON(): IRazzleTable {
    return {
      type: this.getType(),
      columns: this.columns.map((column) => column.toJSON()),
      data: this.data,
      showPagination: this.showPagination,
    }
  }
}

export class RazzleTableColumn extends RazzleWidget {
  children?: RazzleWidget[] | undefined = undefined
  id: string
  header: string
  width?: number

  constructor(props: RazzleTableColumnProps) {
    super()
    this.id = props.id
    this.header = props.header
    this.width = props.width
  }

  getType(): RazzleWidgetType {
    return 'table-column'
  }

  toJSON(): IRazzleTableColumn {
    return {
      type: this.getType(),
      id: this.id,
      header: this.header,
      width: this.width,
    }
  }
}
