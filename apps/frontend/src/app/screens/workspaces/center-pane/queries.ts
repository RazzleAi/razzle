import { useHttpClient } from '../../../http-client'
import { AxiosInstance } from 'axios'
import {
  ActionPlanWithDetailsDto,
  StepDto,
  WorkspaceSearchResponseDto,
} from '@razzle/dto'
import { useQuery } from 'react-query'
import {
  getAppById,
} from '../../../apis'

export function useGetAppById(
  appId: string,
  config?: {
    enabled?: boolean
    refetchOnWindowFocus?: boolean
    refetchInterval?: number | false
  }
) {
  const httpClient = useHttpClient()
  return useQuery(
    ['get-app-by-id', appId],
    async ({ queryKey }) => {
      const [_, appId] = queryKey
      const res = await getAppById(httpClient, appId)
      return res.data.data
    },
    {
      enabled: config?.enabled ?? true,
      refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
      refetchInterval: config?.refetchInterval ?? false,
    }
  )
}

export function useSearchActions(
  searchTerm: string,
  workspaceId: string,
  config?: { onSuccess: (val: WorkspaceSearchResponseDto[]) => void }
) {
  const httpClient = useHttpClient()
  return useQuery(
    ['search-actions', searchTerm, workspaceId],
    ({ queryKey }) => {
      console.log({ queryKey })
      const [_, searchTerm, workspaceId] = queryKey
      return searchActions(httpClient, searchTerm, workspaceId)
    },
    { enabled: false, onSuccess: config?.onSuccess }
  )
}

export function useHandleMessage(
  workspaceId: string,
  prompt: string,
  config?: { onSuccess: (val: StepDto[]) => void; enabled?: boolean }
) {
  const httpClient = useHttpClient()
  return useQuery(
    ['get-action-args', workspaceId, prompt],
    ({ queryKey }) => {
      const [_, workspaceId, prompt] = queryKey
      if (!prompt) {
        console.debug('No prompt')
        return []
      }
      return handleMessage(workspaceId, prompt, httpClient)
    },
    {
      onSuccess: config?.onSuccess,
      enabled: config?.enabled ?? true,
      refetchOnWindowFocus: false,
      refetchInterval: false,
      refetchOnMount: false,
    }
  )
}

export async function handleMessage(
  workspaceId: string,
  prompt: string,
  httpClient: AxiosInstance
): Promise<StepDto[]> {
  console.log('Calling getArgs')
  const response = await httpClient.get(
    `/workspace/${workspaceId}/handleMessage?prompt=${prompt}`
  )

  if (response.status === 200) {
    return response.data.data as StepDto[]
  } else {
    throw new Error(`Failed to handle message for "${prompt}"`)
  }
}

async function searchActions(
  httpClient: AxiosInstance,
  searchTerm: string,
  workspaceId: string
): Promise<WorkspaceSearchResponseDto[]> {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await httpClient.get(`/workspace/${workspaceId}/search`, {
      params: { q: searchTerm },
    })
    const result = response.data.data as WorkspaceSearchResponseDto[]
    return result
  } catch (err) {
    throw err
    // TODO: handle error
  }
}
