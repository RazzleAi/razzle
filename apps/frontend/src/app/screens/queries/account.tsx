import { useQuery } from 'react-query'
import { getAccountMembers } from '../../apis'
import { useHttpClient } from '../../http-client'

export function useGetAccountMembers(accountId: string, cursor?: string) {
  const httpClient = useHttpClient()
  return useQuery(
    ['get-users-in-account', accountId, cursor],
    async ({ queryKey }) => {
      const [_, workspaceId, cursor] = queryKey
      return getAccountMembers(httpClient, workspaceId, cursor)
    },
    { enabled: true }
  )
}
