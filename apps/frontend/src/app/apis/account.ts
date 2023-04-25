/* eslint-disable no-throw-literal */
import { AxiosInstance, AxiosResponse } from 'axios'
import {
  AccountDto,
  AccountDtoWithMemberCountDto,
  AccountWithOwnerDto,
  AppDto,
  AppDtoWithApiKey,
  CreateAccountDto,
  MeResponseDto,
  OnboardingDto,
  Page,
  WorkspaceDto,
} from '@razzle/dto'
import { AccountWithUser } from '@razzle/services'

export function getMe({
  get,
}: AxiosInstance): Promise<AxiosResponse<{ data: MeResponseDto }>> {
  return get<{ data: MeResponseDto }>('/auth/me')
}

export function getAccounts({
  get,
}: AxiosInstance): Promise<
  AxiosResponse<{ data: AccountDtoWithMemberCountDto[] }>
> {
  return get<{ data: AccountDtoWithMemberCountDto[] }>(`/account/user`)
}

export async function createAccount(
  { post }: AxiosInstance,
  data: CreateAccountDto
): Promise<AxiosResponse<{ data: AccountDto; error?: string }>> {
  try {
    return await post(`/account`, data)
  } catch (error) {
    if (error.response) {
      throw error.response.data
    } else if (error.request) {
      throw { message: 'An unknown error occurred' }
    } else {
      throw { message: 'A network error occurred' }
    }
  }
}

export function getAccountById(
  { get }: AxiosInstance,
  accountId: string
): Promise<AxiosResponse<{ data: AccountWithOwnerDto }>> {
  return get<{ data: AccountWithOwnerDto }>(`/account/${accountId}`)
}

export function getAppsInAccount(
  { get }: AxiosInstance,
  accountId: string
): Promise<AxiosResponse<{ data: AppDto[]; error?: string }>> {
  try {
    return get<{ data: AppDto[] }>(`/account/${accountId}/apps`)
  } catch (error) {
    if (error.response) {
      throw error.response.data
    } else if (error.request) {
      throw { message: 'An unknown error occurred' }
    } else {
      throw { message: 'A network error occurred' }
    }
  }
}

export function getPublicApps(
  { get }: AxiosInstance,
): Promise<AxiosResponse<{ data: AppDto[]; error?: string }>> {
  try {
    return get<{ data: AppDto[] }>('/apps/public')
  } catch (error) {
    if (error.response) {
      throw error.response.data
    } else if (error.request) {
      throw { message: 'An unknown error occurred' }
    } else {
      throw { message: 'A network error occurred' }
    }
  }
}

export function getUnsyncedAppsInAccount(
  { get }: AxiosInstance,
  accountId: string
): Promise<AxiosResponse<{ data: AppDtoWithApiKey[]; error?: string }>> {
  try {
    return get<{ data: AppDtoWithApiKey[] }>(
      `/account/${accountId}/unsynced-apps`
    )
  } catch (error) {
    if (error.response) {
      throw error.response.data
    } else if (error.request) {
      throw { message: 'An unknown error occurred' }
    } else {
      throw { message: 'A network error occurred' }
    }
  }
}

export function getOnboardingForAccount(
  { get }: AxiosInstance,
  accountId: string
): Promise<AxiosResponse<{ data: OnboardingDto; error?: string }>> {
  try {
    return get<{ data: OnboardingDto }>(`/account/${accountId}/onboarding`)
  } catch (error) {
    if (error.response) {
      throw error.response.data
    } else if (error.request) {
      throw { message: 'An unknown error occurred' }
    } else {
      throw { message: 'A network error occurred' }
    }
  }
}

export function getWorkspaceForUserAndAccount(
  { get }: AxiosInstance,
  accountId: string
): Promise<AxiosResponse<{ data: WorkspaceDto }>> {
  return get<{ data: WorkspaceDto }>(`/account/${accountId}/workspace`)
}

export async function getAccountMembers(
  httpClient: AxiosInstance,
  accountId: string,
  cursor?: string
): Promise<Page<AccountWithUser>> {
  try {
    let query = `limit=10`
    if (cursor) {
      query += `&cursor=${cursor}`
    }

    const response = await httpClient.get(
      `/account/${accountId}/users?${query}`
    )
    return response.data.data as Page<AccountWithUser>
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
