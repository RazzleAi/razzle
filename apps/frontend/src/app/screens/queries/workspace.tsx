import { useMutation, useQuery } from 'react-query'
import {
  getAllWorkspaceMembers,
  addWorkspaceMembers,
  createWorkspace,
  getAccountById,
  getActionsInWorkspace,
  getMe,
  searchWorkspaceActions,
  getWorkspaceForUserAndAccount,
} from '../../apis'
import { useHttpClient } from '../../http-client'
import {
  AccountDto,
  AddWorkspaceUsersDto,
  CreateWorkspaceDto,
  CreateWorkspaceResponseDto,
  MeResponseDto,
  WorkspaceActionDto,
  WorkspaceDto,
} from '@razzle/dto'

export function useGetAllWorkspaceMembers(
  workspaceId: string,
  props?: { enabled?: boolean }
) {
  const httpClient = useHttpClient()
  return useQuery(
    ['get-all-users-in-workspace', workspaceId],
    async ({ queryKey }) => {
      const [_, workspaceId] = queryKey
      const res = await getAllWorkspaceMembers(httpClient, workspaceId)
      return res.data.data
    },
    { enabled: props?.enabled ?? false }
  )
}

export function useFetchAppCtxData(accountId: string) {
  const httpClient = useHttpClient()

  return useQuery(
    ['getMeAccountAndWorkspace', accountId],
    async ({ queryKey }) => {
      const [_, accountId] = queryKey
      const results = await Promise.all([
        getMe(httpClient),
        getWorkspaceForUserAndAccount(httpClient, accountId),
        getAccountById(httpClient, accountId),
      ])
      const me: MeResponseDto = results[0].data.data
      const workspace: WorkspaceDto = results[1].data.data
      const account: AccountDto = results[2].data.data

      return { me, account, workspace }
    },
    { enabled: false, refetchOnWindowFocus: false, refetchInterval: false }
  )
}

export function useCreateWorkspace(config?: {
  onSuccess: (val: CreateWorkspaceResponseDto) => void
}) {
  const httpClient = useHttpClient()

  return useMutation(
    (data: CreateWorkspaceDto) => {
      return createWorkspace(httpClient, data)
    },
    {
      onSuccess: (response) => {
        const res = response.data.data as CreateWorkspaceResponseDto
        config?.onSuccess(res)
      },
    }
  )
}

export function useAddWorkspaceMembers(config?: { onSuccess: () => void }) {
  const httpClient = useHttpClient()

  return useMutation(
    (data: { workspaceId: string; dto: AddWorkspaceUsersDto }) => {
      return addWorkspaceMembers(httpClient, data.workspaceId, data.dto)
    },
    {
      onSuccess: () => {
        config?.onSuccess()
      },
    }
  )
}

export function useGetWorkspaceActions(workspaceId?: string) {
  const httpClient = useHttpClient()
  return useQuery(
    ['get-workspace-actions', workspaceId],
    async ({ queryKey }) => {
      const [_, workspaceId] = queryKey
      if (!workspaceId) {
        return []
      }
      const res = await getActionsInWorkspace(httpClient, workspaceId)
      return res.data.data as WorkspaceActionDto[]
    },
    { enabled: true }
  )
}

export function useSearchWorkspaceActions(
  query: string,
  workspaceId?: string,
  config?: { enabled?: boolean }
) {
  const httpClient = useHttpClient()
  return useQuery(
    ['search-workspace-actions', workspaceId, query],
    async ({ queryKey }) => {
      const [_, workspaceId, query] = queryKey
      if (!workspaceId) {
        return []
      }
      const res = await searchWorkspaceActions(httpClient, workspaceId, query)
      return res
    },
    {
      enabled: config?.enabled ?? false,
      refetchInterval: false,
      refetchOnWindowFocus: false,
    }
  )
}
