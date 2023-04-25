import { UserDto } from '@razzle/dto'
import { AxiosInstance, AxiosResponse } from 'axios'

export async function searchAccountUsersByEmailOrUsername(
  { get }: AxiosInstance,
  accountId: string,
  query: string
): Promise<AxiosResponse<{ data: UserDto[] }>> {
  try {
    return await get<{ data: UserDto[] }>(
      `/users/search?accountId=${accountId}&query=${query}`
    )
  } catch (error) {
    if (error.response) {
      throw error.response.data
    } else if (error.request) {
      // eslint-disable-next-line no-throw-literal
      throw { message: 'An unknown error occurred' }
    } else {
      // eslint-disable-next-line no-throw-literal
      throw { message: 'A network error occurred' }
    }
  }
}
