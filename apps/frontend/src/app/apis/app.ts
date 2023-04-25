import {
  ActionAndArgsDto,
  AppDto,
  AppSyncStatusDto,
  CreateAppDto,
  CreateAppResponseDto,
  UpdateAppDto,
} from '@razzle/dto'
import { AxiosInstance, AxiosResponse } from 'axios'

export function getAppById(
  { get }: AxiosInstance,
  appId: string
): Promise<AxiosResponse<{ data: AppDto }>> {
  return get<{ data: AppDto }>(`/apps/${appId}`)
}

export function deleteAppById(
  { delete: del }: AxiosInstance,
  appId: string
): Promise<AxiosResponse<{ data: boolean }>> {
  return del<{ data: boolean }>(`/apps/${appId}`)
}

export function getActionArgs(
  { get }: AxiosInstance,
  appId: string,
  actionId: string
): Promise<AxiosResponse<{ data: ActionAndArgsDto }>> {
  return get<{ data: ActionAndArgsDto }>(
    `/apps/${appId}/${actionId}/args`
  )
}

export async function getAppSyncStatus(
  { get }: AxiosInstance,
  appId: string
): Promise<AxiosResponse<{ data: AppSyncStatusDto; error?: string }>> {
  try {
    const response = await get(`/apps/${appId}/status`)
    return response
  } catch (error) {
    handleAxiosErrors(error)
  }
}

export async function createApp(
  { post }: AxiosInstance,
  dto: CreateAppDto
): Promise<AxiosResponse<{ data: CreateAppResponseDto; error?: string }>> {
  try {
    return await post(`/apps`, dto)
  } catch (error) {
    handleAxiosErrors(error)
  }
}

export async function updateApp(
  { put }: AxiosInstance,
  appId: string,
  dto: UpdateAppDto
): Promise<AxiosResponse<{ data: AppDto; error?: string }>> {
  try {
    return await put(`/apps/${appId}`, dto)
  } catch (error) {
    handleAxiosErrors(error)
  }
}

export async function generateNewAPIKey(
  { post }: AxiosInstance,
  appId: string
): Promise<AxiosResponse<{ data: string; error?: string }>> {
  try {
    return await post(`/apps/${appId}/api-key`)
  } catch (error) {
    handleAxiosErrors(error)
  }
}

function handleAxiosErrors(error) {
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