import { IActionTrigger } from './action-trigger'

export interface IPagination {
  viewId?: string
  pageNumber: number
  pageSize: number
  pageAction: IActionTrigger
  totalCount: number
}
