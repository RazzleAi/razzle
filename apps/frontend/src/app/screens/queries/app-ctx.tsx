import { useQuery } from 'react-query'
import {
  getAccountById,
  getMe,
} from '../../apis'
import { useHttpClient } from '../../http-client'
import {
  AccountDto,
  MeResponseDto,
} from '@razzle/dto'

export function useFetchAppCtxData(accountId: string) {
  const httpClient = useHttpClient()

  return useQuery(
    ['getMeAndAccount', accountId],
    async ({ queryKey }) => {
      const [_, accountId] = queryKey
      const results = await Promise.all([
        getMe(httpClient),
        getAccountById(httpClient, accountId),
      ])
      const me: MeResponseDto = results[0].data.data
      const account: AccountDto = results[1].data.data

      return { me, account }
    },
    { enabled: false, refetchOnWindowFocus: false, refetchInterval: false }
  )
}

