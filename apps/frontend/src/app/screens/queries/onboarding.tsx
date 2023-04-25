import { useQuery } from 'react-query'
import { getOnboardingForAccount } from '../../apis'
import { useHttpClient } from '../../http-client'
import { useOnboardingStore } from '../../stores/onboarding.store'

export function useFetchOnboardingStatus(
  accountId: string,
  config?: {
    enabled?: boolean
    refetchOnWindowFocus?: boolean
    refetchInterval?: number | false
  }
) {
  const httpClient = useHttpClient()
  const { setOnboarding } = useOnboardingStore()
  return useQuery(
    ['getOnboardingForAccount', accountId],
    async ({ queryKey }) => {
      const [_, accountId] = queryKey
      const response = await getOnboardingForAccount(httpClient, accountId)
      setOnboarding(response.data.data)
      return response.data.data
    },
    {
      enabled: config?.enabled ?? true,
      refetchInterval: config?.refetchInterval ?? false,
    }
  )
}
