import { CreateAccountDto, CreateAccountResponseDto } from '@razzle/dto'
import { useMutation, useQuery } from 'react-query'
import { createAccount, getAccounts } from '../../apis'
import { useHttpClient } from '../../http-client'

export function useGetAccounts() {
  const httpClient = useHttpClient()
  return useQuery(
    ['get-accounts'],
    async () => {
      const res = await getAccounts(httpClient)
      return res.data.data
    },
    { refetchOnWindowFocus: false, refetchOnMount: true }
  )
}

export function useCreateAccount(config?: {
  onSuccess: (val: CreateAccountResponseDto) => void
}) {
  const httpClient = useHttpClient()
  return useMutation(
    (data: CreateAccountDto) => {
      return createAccount(httpClient, data)
    },
    {
      onSuccess: (response) => {
        const res = response.data.data as CreateAccountResponseDto
        config?.onSuccess(res)
      },
    }
  )
}
