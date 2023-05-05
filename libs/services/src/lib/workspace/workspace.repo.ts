import { Workspace, WorkspaceUser, WorkspaceApp as PrismaWorkspaceApp } from '@prisma/client'
import { Page, PageParams } from '@razzle/dto'
import { User } from '../user'
import { App } from '../apps'


export type WorkspaceWithUser = WorkspaceUser & {workspace: Workspace, user: User}
export type UpdateWorkspaceInput = Partial<Omit<Workspace, 'id' | 'accountId' | 'deleted' | 'createdAt' | 'updatedAt'>>
export type WorkspaceApp = PrismaWorkspaceApp & {app: App; workspace: Workspace}

export interface WorkspaceRepo {
  findById(id: string): Promise<Workspace | null>
  getAppsInWorkspace(workspaceId: string): Promise<App[]>  
  createWorkspaceWithUser(
    workspace: Omit<Workspace, 'id' | 'deleted' | 'createdAt' | 'updatedAt'>,
    userId: string,
  ): Promise<WorkspaceWithUser>
  deleteWorkspaceById(workspaceId: string): Promise<void>
  findWorkspacesByAccountId(accountId: string): Promise<Workspace[]>
  addUserToWorkspace(workspaceId: string, userId: string): Promise<void>
  addUsersToWorkspace(workspaceId: string, userIds: string[]): Promise<void>
  countUsersInWorkspace(workspaceId: string): Promise<number>
  getAllUsersInWorkspace(workspaceId: string): Promise<WorkspaceWithUser[]>
  getUsersInWorkspace(
    workspaceId: string,
    pageParams: PageParams,
  ): Promise<Page<WorkspaceWithUser>>
  removeUserFromWorkspace(workspaceId: string, userId: string): Promise<void>
  addAppToWorkspace(workspaceId: string, appId: string): Promise<WorkspaceApp>
  removeAppFromWorkspace(workspaceId: string, appId: string): Promise<void>
  isAppInWorkspace(workspaceId: string, appId: string): Promise<boolean>  
  getWorkspaceApp(workspaceId: string, appId: string): Promise<WorkspaceApp | null>
  findWorkspacesByUserIdAndAccountId(userId: string, accountId: string): Promise<Workspace[]>
  updateWorkspace(id: string, data: Partial<Workspace>): Promise<Workspace>
  // TODO: DELETE THIS AFTER DEPLOYMENT
  getAllWorkspaces(): Promise<Workspace[]>
  forceDeleteWorkspace(id: string): Promise<void>
  findAllWorkspacesByAccountId(accountId: string): Promise<Workspace[]>
}
