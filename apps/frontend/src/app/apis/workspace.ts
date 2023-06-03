import {
  AddWorkspaceUsersDto,
  CreateWorkspaceDto,
  CreateWorkspaceResponseDto,
  Page,
  WorkspaceActionDto,
  WorkspaceDto,
} from '@razzle/dto'
import { WorkspaceWithUser } from '@razzle/services'
import { AxiosInstance, AxiosResponse } from 'axios'

export async function createWorkspace(
  { post }: AxiosInstance,
  data: CreateWorkspaceDto
): Promise<
  AxiosResponse<{ data: CreateWorkspaceResponseDto; error?: string }>
> {
  try {
    return await post(`/workspace`, data)
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

export function getActionsInWorkspace(
  { get }: AxiosInstance,
  workspaceId: string
): Promise<AxiosResponse<{ data: WorkspaceActionDto[] }>> {
  return get<{ data: WorkspaceActionDto[] }>(
    `/workspace/${workspaceId}/actions`
  )
}

export async function getWorkspaceMembers(
  httpClient: AxiosInstance,
  workspaceId: string,
  cursor?: string
): Promise<Page<WorkspaceWithUser>> {
  // eslint-disable-next-line no-useless-catch
  try {
    let query = `limit=10`
    if (cursor) {
      query += `&cursor=${cursor}`
    }

    const response = await httpClient.get(
      `/workspace/${workspaceId}/members?${query}`
    )
    return response.data.data as Page<WorkspaceWithUser>
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

export async function getWorkspaceMemberCount(
  httpClient: AxiosInstance,
  workspaceId: string
): Promise<number> {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await httpClient.get(
      `/workspace/${workspaceId}/member-count`
    )
    return response.data.data as number
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

export async function getAllWorkspaceMembers(
  httpClient: AxiosInstance,
  workspaceId: string
): Promise<AxiosResponse<{ data: WorkspaceWithUser[]; error: string }>> {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await httpClient.get(
      `/workspace/${workspaceId}/all-members`
    )
    return response
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

export async function addWorkspaceMembers(
  httpClient: AxiosInstance,
  workspaceId: string,
  data: AddWorkspaceUsersDto
): Promise<void> {
  // eslint-disable-next-line no-useless-catch
  try {
    await httpClient.post(`/workspace/${workspaceId}/members`, data)
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

export async function searchWorkspaceActions(
  httpClient: AxiosInstance,
  workspaceId: string,
  query: string
): Promise<WorkspaceActionDto[]> {
  // eslint-disable-next-line no-useless-catch
  try {
    const response = await httpClient.get(
      `/workspace/${workspaceId}/actions/searches?query=${query}`
    )
    return response.data.data as WorkspaceActionDto[]
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
