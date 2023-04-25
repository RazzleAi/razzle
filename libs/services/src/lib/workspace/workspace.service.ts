import { Prisma, Workspace } from '@prisma/client'
import {
  CreateWorkspaceDto,
  Page,
  PageParams,
  WorkspaceActionDto,
} from '@razzle/dto'
import {
  PromptResolverService,
  EmbeddingSearchService,
  EmbeddingSentencePair,
  SentenceSimilariyPair,
} from '../ml'
import {
  UpdateWorkspaceInput,
  WorkspaceRepo,
  WorkspaceWithUser,
} from './workspace.repo'
import { DefaultAppsService } from '../default-apps'
import { App, AppsService } from '../apps'
import { Logger } from '@nestjs/common'
import {
  DuplicateWorkspaceNameException,
  WorkspaceNotFoundException,
} from './exceptions'
import { AppCreatedEventPayload, APP_CREATED_EVENT, EventBus } from '../event'
import { find } from 'lodash'

export class WorkspaceService {
  private logger = new Logger(WorkspaceService.name)

  constructor(
    private readonly workspaceRepo: WorkspaceRepo,
    private readonly embeddingSearchService: EmbeddingSearchService,
    private readonly promptResolverService: PromptResolverService,
    private readonly appsService: AppsService,
    private readonly defaultAppsService: DefaultAppsService,
    eventBus: EventBus
  ) {
    this.handleEvents(eventBus)
  }

  async findById(id: string): Promise<Workspace | null> {
    return this.workspaceRepo.findById(id)
  }

  async findWorkspaceInAccountByName(
    accountId: string,
    workspaceName: string
  ): Promise<Workspace | null> {
    const workspacesInAccount =
      await this.workspaceRepo.findWorkspacesByAccountId(accountId)
    const workspace = workspacesInAccount.find((w) => w.name === workspaceName)
    return workspace || null
  }

  async createWorkspaceWithUser(
    createWorkspaceDto: CreateWorkspaceDto,
    userId: string
  ): Promise<WorkspaceWithUser> {
    await this.checkIfWorkspaceNameExists(
      createWorkspaceDto.accountId,
      createWorkspaceDto.name
    )

    const result = await this.workspaceRepo.createWorkspaceWithUser(
      {
        ...createWorkspaceDto,
        description: createWorkspaceDto.description || null,
        isDefault: createWorkspaceDto.isDefault || false,
      },
      userId
    )
    await this.addDefaultAppsToWorkspace(result.workspaceId)
    return result
  }

  private async checkIfWorkspaceNameExists(
    accountId: string,
    workspaceName: string
  ): Promise<void> {
    const workspaceInAccount = await this.findWorkspaceInAccountByName(
      accountId,
      workspaceName
    )
    if (workspaceInAccount) {
      this.logger.warn(
        `Workspace with name "${workspaceName}" already exists in account ${accountId}`
      )
      throw new DuplicateWorkspaceNameException(
        `A "${workspaceName}" workspace already exists in this account`
      )
    }
  }

  async deleteWorkspace(workspaceId: string): Promise<void> {
    const workspace = await this.workspaceRepo.findById(workspaceId)
    if (!workspace) {
      throw new WorkspaceNotFoundException(`Workspace ${workspaceId} not found`)
    }

    await this.workspaceRepo.deleteWorkspaceById(workspaceId)
  }

  async addUserToWorkspace(userId: string, workspaceId: string): Promise<void> {
    return this.workspaceRepo.addUserToWorkspace(workspaceId, userId)
  }

  async addUsersToWorkspace(
    workspaceId: string,
    userIds: string[]
  ): Promise<void> {
    return this.workspaceRepo.addUsersToWorkspace(workspaceId, userIds)
  }

  async removeUserFromWorkspace(
    userId: string,
    workspaceId: string
  ): Promise<void> {
    return this.workspaceRepo.removeUserFromWorkspace(workspaceId, userId)
  }

  async getAllUsersInWorkspace(
    workspaceId: string
  ): Promise<WorkspaceWithUser[]> {
    return this.workspaceRepo.getAllUsersInWorkspace(workspaceId)
  }

  async getUsersInWorkspace(
    workspaceId: string,
    pageParams: PageParams
  ): Promise<Page<WorkspaceWithUser>> {
    return this.workspaceRepo.getUsersInWorkspace(workspaceId, pageParams)
  }

  async countUsersInWorkspace(workspaceId: string): Promise<number> {
    const count = await this.workspaceRepo.countUsersInWorkspace(workspaceId)
    return count
  }

  async getAppsInWorkspace(workspaceId: string): Promise<App[]> {
    return this.workspaceRepo.getAppsInWorkspace(workspaceId)
  }

  async getActionsInWorkspace(
    workspaceId: string
  ): Promise<WorkspaceActionDto[]> {
    const apps = await this.getAppsInWorkspace(workspaceId)
    const actions: WorkspaceActionDto[] = []
    for (const app of apps) {
      const appActions = app.data
        ? ((app.data as Prisma.JsonObject)['actions'] as Prisma.JsonArray)
        : []

      const actionsArr = appActions as Prisma.JsonArray
      for (const act of actionsArr) {
        if (!act) continue
        const action: any = act
        if (action.stealth === true) {
          continue
        }

        actions.push({
          appId: app.id,
          razzleAppId: app.appId,
          appName: app.name,
          appDescription: app.description,
          workspaceId: workspaceId,
          actionName: action.name,
          actionDescription: action.description,
          parameters: action.parameters.map((param: any) => ({
            name: param.name,
            type: param.type,
          })),
        })
      }
    }
    return actions
  }

  async searchActionsInWorkspace(
    workspaceId: string,
    query: string
  ): Promise<WorkspaceActionDto[]> {
    const res = await this.searchInWorkspace(workspaceId, query)
    return res.map((r) => ({
      appId: r.appId,
      razzleAppId: r.razzleAppId,
      appName: r.appName,
      appDescription: r.actionDescription,
      actionName: r.actionName,
      actionDescription: r.actionDescription,
      workspaceId: workspaceId,
      parameters: r.parameters,
    }))
  }

  async getSentencesAndEmbeddingInWorkspace(
    workspaceId: string
  ): Promise<EmbeddingSentencePair[]> {
    const apps = await this.getAppsInWorkspace(workspaceId)
    return apps
      .map((app) => {
        const actions = app.data
          ? (app.data as Prisma.JsonObject)['actions']
          : []

        const descriptions = (actions as Prisma.JsonArray)
          .filter((action: any) => action.stealth === false)
          .map((action: any) => ({
            title: action.description,
            embedding: action.descriptionEmbedding,
            actionName: action.name,
            actionDescription: action.description,
            parameters: action.parameters,
          }))

        const pairs = descriptions.map((example: any) => {
          return {
            sentence: example.title,
            embedding: example.embedding,
            appId: app.id,
            razzleAppId: app.appId,
            appName: app.name,
            actionName: example.actionName,
            actionDescription: example.actionDescription,
            parameters: example.parameters,
          }
        })

        return pairs
      })
      .flat()
  }

  async searchInWorkspace(
    workspaceId: string,
    searchQuery: string
  ): Promise<SentenceSimilariyPair[]> {
    // TODO: Cache this
    const searchSpace = await this.getSentencesAndEmbeddingInWorkspace(
      workspaceId
    )

    return this.embeddingSearchService.search(searchSpace, searchQuery)
  }

  async addDefaultAppsToWorkspace(workspaceId: string): Promise<void> {
    const defaultApps = this.defaultAppsService.getDefaultApps()
    for (const appData of defaultApps) {
      const app = await this.appsService.getByAppId(appData.appId!)
      if (!app) {
        this.logger.log(
          `Cannot add App - ${appData.name} to workspace ${workspaceId} because this app was not found`
        )
        continue
      }

      await this.addAppToWorkspace(app.id, workspaceId)
      this.logger.log(`Added - ${appData.name} to workspace ${workspaceId}`)
    }
  }

  async addAppToWorkspace(appId: string, workspaceId: string): Promise<void> {
    if (await this.workspaceRepo.isAppInWorkspace(workspaceId, appId)) {
      return
    }
    return this.workspaceRepo.addAppToWorkspace(workspaceId, appId)
  }

  async removeAppFromWorkspace(
    appId: string,
    workspaceId: string
  ): Promise<void> {
    return this.workspaceRepo.removeAppFromWorkspace(workspaceId, appId)
  }

  async updateWorkspace(
    workspaceId: string,
    update: UpdateWorkspaceInput
  ): Promise<Workspace> {
    return this.workspaceRepo.updateWorkspace(workspaceId, update)
  }

  async handleMessage(workspaceId: string, prompt: string) {
    const apps = (await this.getAppsInWorkspace(workspaceId)).filter(
      (a) => a.data != null
    )

    return this.promptResolverService.handleMessage(prompt, apps)
  }

  async getWorkspacesForUserAndAccount(
    userId: string,
    accountId: string
  ): Promise<Workspace[]> {
    const res = this.workspaceRepo.findWorkspacesByUserIdAndAccountId(
      userId,
      accountId
    )
    return res
  }

  async getWorkspacesForAccount(accountId: string): Promise<Workspace[]> {
    return this.workspaceRepo.findWorkspacesByAccountId(accountId)
  }

  private handleEvents(eventBus: EventBus) {
    eventBus.on(APP_CREATED_EVENT, async (event: unknown) => {
      const payload = event as AppCreatedEventPayload
      const workspaces = await this.getWorkspacesForAccount(payload.accountId)
      const defaultWorkspace = find(workspaces, (w) => w.isDefault)
      if (!defaultWorkspace) {
        return
      }
      await this.workspaceRepo.addAppToWorkspace(
        defaultWorkspace.id,
        payload.id
      )
    })
  }
}
