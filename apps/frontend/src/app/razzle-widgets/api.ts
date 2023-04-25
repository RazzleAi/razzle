import {
  ActionAndArgsDto,
} from '@razzle/dto'
import { useMutation } from 'react-query'
import { getActionArgs } from '../apis'
import { useHttpClient } from '../http-client'

export function useGetActionArgs(config?: {
  onSuccess?: (val: ActionAndArgsDto) => void
}) {
  const httpClient = useHttpClient()
  return useMutation(
    async (data: { appId: string; action: string }) => {
      const result = await getActionArgs(httpClient, data.appId, data.action)
      return result.data.data
    },
    { onSuccess: config?.onSuccess }
  )
}
