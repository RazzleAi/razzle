import { RazzleResponse, RazzleResponseWithActionArgs } from '@razzledotai/sdk'
import { IRazzleWidget } from '@razzledotai/widgets'
import { clamp } from 'lodash'
import { useState } from 'react'
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi'
import { renderReponse } from '../../../utils/render-reponse'
import { useWSClientStore } from '../../../stores/ws-client-store'
import { useFirebaseServices } from '../../../firebase'
import { MessageType, Pagination, ServerMessage, ServerMessageV2, StepDto } from '@razzle/dto'
import { useMessageDetails } from './history-item-view'
import { useAppStore } from '../../../stores/app-store'

export interface ServerMessageViewProps {
  messageType: MessageType
  message: ServerMessage | ServerMessageV2
  isFramed?: boolean
  frameId?: string
}

export function ServerMessageView(props: ServerMessageViewProps) {
  const msgData = props.messageType === 'ServerMessageV2' ? (props.message as ServerMessageV2).data.payload :  (props.message as ServerMessage).data.message

  const message = props.isFramed
    ? (msgData as RazzleResponseWithActionArgs)
    : (msgData as RazzleResponse)
  const responseWidget = message.ui as unknown as IRazzleWidget
  const pagination = message.pagination as unknown as Pagination
  const actionArgs = props.isFramed
    ? (message as RazzleResponseWithActionArgs).actionAndArgs
    : undefined

  const { account, currentWorkspace } = useAppStore()
  const { appName, applicationId, appId } = useMessageDetails()
  const { currentUser } = useFirebaseServices()
  const { triggerPaginationAction } = useWSClientStore()
  
  function onPageChanged(newPage: number) {
    if (!actionArgs) {
      console.debug('onPageChanged', newPage, 'no action args')
      return
    }

    const prompt  = props.messageType === 'ServerMessageV2' ? (props.message as ServerMessageV2).data.payload.requestPrompt :  actionArgs.actionDescription
    const steps: StepDto[] = []
    steps.push({
      id: 1,
      actionName: actionArgs?.actionName,
      actionDescription: actionArgs?.actionDescription,
      razzleAppId: applicationId,
      appId: appId,
      appName: appName,
      actionInput:
        actionArgs?.actionArgs?.map((a) => ({
          name: a.name,
          type: a.type,
          value: a.value as string,
        })) || [],
    })

    if (!account || !currentWorkspace) {
      console.debug('onPageChanged', newPage, 'no account or workspace')
      return
    }
    currentUser.getIdToken().then((token) => {
      const updatedPagination = { ...pagination, pageNumber: newPage }
      triggerPaginationAction(
        token,
        account.id,
        currentWorkspace.id,
        prompt,
        steps,
        updatedPagination
      )
    })
  }

  return (
    <div className="w-2/3 overflow-auto">
      <div className="bg-white rounded overflow-auto w-fit min-w-fit max-w-full border border-[#E8EBED]">
        {renderReponse(responseWidget)}
        {pagination && (
          <ViewPagination
            pagination={pagination}
            onPageChanged={onPageChanged}
          />
        )}
      </div>
    </div>
  )
}

export function ViewPagination(props: {
  pagination: Pagination
  onPageChanged?: (newPage: number) => void
}) {
  const { pagination } = props
  return (
    <div className="flex flex-row items-center justify-between bg-gray-100 border-t border-t-gray-200 py-2 px-3 w-full">
      <PaginationIndicator pagination={pagination} />
      <PaginationControls
        pagination={pagination}
        onPageChanged={props.onPageChanged}
      />
    </div>
  )
}

function PaginationIndicator(props: { pagination: Pagination }) {
  const { pagination } = props
  const currPageStart = (pagination.pageNumber - 1) * pagination.pageSize + 1
  const currPageEnd = pagination.pageNumber * pagination.pageSize
  return (
    <div className="text-gray-500 text-sm font-medium mr-3">
      <span>
        Showing {currPageStart} -{' '}
        {currPageEnd < pagination.totalCount
          ? currPageEnd
          : pagination.totalCount}{' '}
        of {pagination.totalCount}
      </span>
    </div>
  )
}

function PaginationControls(props: {
  pagination: Pagination
  onPageChanged?: (newPage: number) => void
}) {
  const { pagination, onPageChanged } = props
  const [currPageNum, setCurrPageNum] = useState<number>(pagination.pageNumber)
  const { pageSize, totalCount } = pagination
  const totalPages = Math.ceil(totalCount / pageSize)

  const pageOptions = []
  for (let i = 1; i <= totalPages; i++) {
    pageOptions.push(i)
  }

  return (
    totalCount > pageSize && (
      <div className="flex flex-row items-center justify-center gap-1 text-sm text-gray-500 font-medium">
        <button
          onClick={() => {
            const pageNum = clamp(currPageNum - 1, 1, totalPages)
            if (pageNum === currPageNum) {
              return
            }
            setCurrPageNum(pageNum)
            onPageChanged?.(pageNum)
          }}
        >
          <BiChevronLeft size={18} />
        </button>
        <div className="flex flex-row items-center justify-center w-6 h-7 ">
          <input
            type="text"
            className="flex text-center w-full rounded p-1 border-gray-300 focus:border-gray-300 outline-none focus:ring-0"
            value={currPageNum}
            onChange={(e) => {
              const newPageNum = parseInt(e.target.value)
              if (
                newPageNum !== currPageNum &&
                newPageNum > 0 &&
                newPageNum <= totalPages
              ) {
                setCurrPageNum(newPageNum)
                onPageChanged?.(newPageNum)
              }
            }}
          />
        </div>
        <span>of</span>
        <span>{totalPages}</span>
        <button
          onClick={() => {
            const pageNum = clamp(currPageNum + 1, 1, totalPages)
            if (pageNum === currPageNum) {
              return
            }
            setCurrPageNum(pageNum)
            onPageChanged?.(pageNum)
          }}
        >
          <BiChevronRight size={18} />
        </button>
      </div>
    )
  )
}
