import { IRazzleWidget } from './razzle-widget'

export interface IRazzleTable extends IRazzleWidget {
  columns: IRazzleTableColumn[]
  data: string[][]
  showPagination?: boolean
}

export interface IRazzleTableColumn extends IRazzleWidget {
  id: string
  header: string
  width?: number
}
