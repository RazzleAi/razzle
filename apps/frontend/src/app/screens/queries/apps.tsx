import {
  AppDto,
  CreateAppDto,
  CreateAppResponseDto,
  UpdateAppDto,
} from '@razzle/dto'
import { useMutation, useQuery } from 'react-query'
import {
  addAppToAccount,
  createApp,
  deleteAppById,
  generateNewAPIKey,
  getAppById,
  getAppsInAccount,
  getAppSyncStatus,
  getPublicApps,
  getUnsyncedAppsInAccount,
  isAppInAccount,
  removeAppFromAccount,
  updateApp,
} from '../../apis'
import { useHttpClient } from '../../http-client'
import { QueryConfig } from './types'

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
  props?: QueryConfig
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

export function useIsAppInAccount(
  accountId: string,
  appId: string,
  config?: QueryConfig
) {
  const httpClient = useHttpClient()
  return useQuery(
    ['is-app-in-account', accountId, appId],
    async ({ queryKey }) => {
      const [_, accountId, appId] = queryKey
      const res = await isAppInAccount(httpClient, accountId, appId)
      return res.data.data
    },
    { enabled: config?.enabled ?? false }
  )
}

export function useAddAppToAccount(config?: {
  onSuccess: (resp: AppDto) => void
}) {
  const httpClient = useHttpClient()
  return useMutation(
    async (data: { accountId: string; appId: string }) => {
      return await addAppToAccount(httpClient, data.accountId, data.appId)
    },
    {
      onSuccess: (resp) => {
        config?.onSuccess(resp.data.data)
      },
    }
  )
}

export function useRemoveAppFromAccount(config?: {
  onSuccess: (resp: boolean) => void
}) {
  const httpClient = useHttpClient()
  return useMutation(
    async (data: { accountId: string; appId: string }) => {
      return await removeAppFromAccount(httpClient, data.accountId, data.appId)
    },
    {
      onSuccess: (resp) => {
        config?.onSuccess(resp.data.data)
      },
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

export function useGetAppSyncStatus(appId: string, config?: QueryConfig) {
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
      refetchOnWindowFocus: config?.refetchOnWindowFocus ?? false,
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
