import { IPagination } from '../common/pagination'
import { IRazzleWidget } from './razzle-widget'

export interface IRazzleCustomTable extends IRazzleWidget {
  id?: string
  title?: string
  columns: IRazzleCustomTableColumn[]
  rows: IRazzleCustomTableRow[]
  pagination?: IPagination
}

export interface IRazzleCustomTableColumn extends IRazzleWidget {
  id: string
  header: string
  widthPct?: number
}

export interface IRazzleCustomTableRow extends IRazzleWidget {
  cells: IRazzleCustomTableCell[]
}

export interface IRazzleCustomTableCell extends IRazzleWidget {
  id: string
  widget: IRazzleWidget
}
