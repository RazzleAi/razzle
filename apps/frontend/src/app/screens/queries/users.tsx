import { useQuery } from 'react-query'
import { searchAccountUsersByEmailOrUsername } from '../../apis'
import { useHttpClient } from '../../http-client'

export function useSearchUsers(
  accountId: string,
  query: string,
  props?: { enabled?: boolean }
) {
  const httpClient = useHttpClient()

  return useQuery(
    ['searchUsers', accountId, query],
    async ({ queryKey }) => {
      const [_, accountId, query] = queryKey

      if (!query || query.trim() === '' || !accountId) {
        return []
      }

      const response = await searchAccountUsersByEmailOrUsername(
        httpClient,
        accountId,
        query
      )
      return response.data.data
    },
    {
      enabled: props?.enabled ?? false,
      refetchOnWindowFocus: false,
      refetchInterval: false,
    }
  )
}
