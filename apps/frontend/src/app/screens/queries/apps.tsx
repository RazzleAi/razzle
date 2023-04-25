import {
  AppDto,
  CreateAppDto,
  CreateAppResponseDto,
  UpdateAppDto,
} from '@razzle/dto'
import { useMutation, useQuery } from 'react-query'
import {
  createApp,
  deleteAppById,
  generateNewAPIKey,
  getAppsInAccount,
  getAppSyncStatus,
  getPublicApps,
  getUnsyncedAppsInAccount,
  updateApp,
} from '../../apis'
import { useHttpClient } from '../../http-client'

export function useGetAppsInAccount(
  accountId: string,
  props?: { enabled?: boolean }
) {
  const httpClient = useHttpClient()
  return useQuery(
    ['get-apps-in-account', accountId],
    async ({ queryKey }) => {
      const [_, accountId] = queryKey
      const res = await getAppsInAccount(httpClient, accountId)
      return res.data.data
    },
    { enabled: props?.enabled ?? false }
  )
}

export function useGetPublicApps(props?: { enabled?: boolean }) {
  const httpClient = useHttpClient()
  return useQuery(
    'get-public-apps',
    async () => {
      const res = await getPublicApps(httpClient)
      return res.data.data
    },
    { enabled: props?.enabled ?? false }
  )
}

export function useDeleteApp(config?: { onSuccess: (resp: boolean) => void }) {
  const httpClient = useHttpClient()
  return useMutation(
    async (appId: string) => {
      return await deleteAppById(httpClient, appId)
    },
    {
      onSuccess: (resp) => {
        config?.onSuccess(resp.data.data)
      },
    }
  )
}

export function useGetUnsyncedAppsInAccount(
  accountId: string,
  props?: {
    enabled?: boolean
    refetchInterval?: number | false
    refetchOnWindowFocus?: boolean
  }
) {
  const httpClient = useHttpClient()
  return useQuery(
    ['get-unsynced-apps-in-account', accountId],
    async ({ queryKey }) => {
      const [_, accountId] = queryKey
      const res = await getUnsyncedAppsInAccount(httpClient, accountId)
      return res.data.data
    },
    {
      enabled: props?.enabled ?? false,
      refetchInterval: props?.refetchInterval ?? 5000,
      refetchOnWindowFocus: props?.refetchOnWindowFocus ?? false,
    }
  )
}

export function useCreateApp(config?: {
  onSuccess: (data: CreateAppResponseDto) => void
}) {
  const httpClient = useHttpClient()
  return useMutation(
    (data: CreateAppDto) => {
      return createApp(httpClient, data)
    },
    {
      onSuccess: (resp) => {
        config?.onSuccess(resp.data.data)
      },
    }
  )
}

export function useUpdateApp(config?: { onSuccess: (data: AppDto) => void }) {
  const httpClient = useHttpClient()
  return useMutation(
    (data: { id: string; data: UpdateAppDto }) => {
      return updateApp(httpClient, data.id, data.data)
    },
    {
      onSuccess: (resp) => {
        config?.onSuccess(resp.data.data)
      },
    }
  )
}

export function useGetAppSyncStatus(
  appId: string,
  config?: { enabled?: boolean; refetchInterval?: number }
) {
  const httpClient = useHttpClient()
  return useQuery(
    ['get-app-sync-status', appId],
    async ({ queryKey }) => {
      const [_, appId] = queryKey
      const res = await getAppSyncStatus(httpClient, appId)
      return res.data.data
    },
    {
      enabled: config?.enabled ?? true,
      refetchInterval: config?.refetchInterval ?? 5000,
    }
  )
}

export function useGenerateNewAPIKey(config?: {
  onSuccess: (apiKey: string) => void
}) {
  const httpClient = useHttpClient()
  return useMutation(
    async (appId: string) => {
      return await generateNewAPIKey(httpClient, appId)
    },
    {
      onSuccess: (resp) => {
        config?.onSuccess(resp.data.data)
      },
    }
  )
}
