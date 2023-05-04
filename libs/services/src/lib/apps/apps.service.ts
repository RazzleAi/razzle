import { Prisma } from '@prisma/client'
import {
  AgentSyncDto,
  AppSyncStatusDto,
  CreateAppDto,
  CreateAppResponseDto,
  UpdateAppDto,
} from '@razzle/dto'
import { AppsRepo } from './apps.repo'
import { DuplicateAppException } from './exceptions'
import { createHash } from 'crypto'
import { AppNotFoundException } from './exceptions/app-not-found.exception'
import { EmbeddingService } from '../ml'
import { Action } from './action'
import {
  AppCreatedEventPayload,
  AppSyncedEventPayload,
  APP_CREATED_EVENT,
  EventBus,
  FIRST_APP_CREATED_EVENT,
  FIRST_APP_SYNCED_EVENT,
} from '../event'
import { AnalyticsEventTracker, APP_SYNCED_EVENT } from '../analytics'
import { App, UpdateAppInput } from './types'
import { User } from '../user'
import { InvalidHandleException } from './exceptions/invalid-handle.exception'

export class AppsService {
  constructor(
    private readonly appsRepo: AppsRepo,
    private readonly embeddingService: EmbeddingService,
    private readonly eventBus: EventBus,
    private readonly analyticsEventTracker: AnalyticsEventTracker
  ) {}

  async createApp(
    accountId: string,
    user: User,
    app: CreateAppDto,
    optionalProps?: { appId?: string; apiKey?: string; isDefault?: boolean }
  ): Promise<CreateAppResponseDto> {
    const appId = optionalProps?.appId ?? this.generateNewAppId(accountId)
    const existingApp = await this.appsRepo.findByAppId({ appId })
    if (existingApp) {
      throw new DuplicateAppException(`An app with ${appId} already exists`)
    }

    await this.validateHandle(app, user)

    const appsInAccount = await this.getAppsCreatedByAccount(accountId)
    for (const appInAccount of appsInAccount) {
      if (appInAccount.name === app.name) {
        throw new DuplicateAppException(
          `An app with name ${app.name} already exists`
        )
      }
    }

    const apiKey =
      optionalProps?.apiKey ?? (await this.generateNewApiKey(appId))
    const isDefault = optionalProps?.isDefault ?? false
    const newApp: CreateAppDto & {
      appId: string
      apiKey: string
      isDefault: boolean
    } = {
      ...app,
      appId,
      apiKey,
      isDefault,
    }

    const createdApp = await this.appsRepo.createApp(accountId, newApp)
    const event: AppCreatedEventPayload = { accountId, ...createdApp }
    this.eventBus.emit(APP_CREATED_EVENT, event)
    const nonDefaultApps = appsInAccount.filter((app) => !app.isDefault)
    if (nonDefaultApps.length === 0) {
      this.eventBus.emit(FIRST_APP_CREATED_EVENT, event)
    }
    return createdApp
  }

  async getPublicApps(): Promise<App[]> {
    const apps = await this.appsRepo.findPublicApps()
    return apps
  }

  private async validateHandle(app: CreateAppDto, user: User) {
    const existingAppWithHandle = await this.appsRepo.findNonDeletedByHandle({
      handle: app.handle,
    })
    if (existingAppWithHandle) {
      throw new DuplicateAppException(
        `An app with handle ${app.handle} already exists`
      )
    }

    // make sure handle is of the form username/handle
    const handleParts = app.handle.split('/')
    if (handleParts.length !== 2) {
      throw new InvalidHandleException(
        'Handle must be of the form username/handle'
      )
    }

    const usernameFromHandle = handleParts[0]
    const username = user.username
    if (usernameFromHandle !== username) {
      throw new InvalidHandleException(
        `Handle must be of the form ${username}/handle`
      )
    }
  }

  async getAppsCreatedByAccount(accountId: string): Promise<App[]> {
    return this.appsRepo.findAllByCreatorId(accountId)
  }

  async getAppsForUser(userId: string): Promise<App[]> {
    return this.appsRepo.findAllByCreatorId(userId)
  }

  async getByAppId(appId: string): Promise<App | null> {
    return this.appsRepo.findByAppId({ appId })
  }

  async getById(id: string): Promise<App | null> {
    return this.appsRepo.findById(id)
  }

  async updateAppById(id: string, app: UpdateAppDto): Promise<App | null> {
    const existingApp = await this.appsRepo.findById(id)
    if (!existingApp) {
      throw new AppNotFoundException(`App with id ${id} not found`)
    }

    const data: UpdateAppInput = {
      name: app.name,
      description: app.description,
    }
    if (app.isPublic !== undefined) {
      data.isPublic = app.isPublic
    }
    
    return this.appsRepo.updateApp(id, data)
  }

  // TODO: DELETE THIS AFTER MIGRATING APP HANDLES IN PROD
  async updateAppHandle(id: string, handle: string): Promise<App | null> {
    const existingApp = await this.appsRepo.findById(id)
    if (!existingApp) {
      throw new AppNotFoundException(`App with id ${id} not found`)
    }

    const data: UpdateAppInput = {
      handle,
    }
    return this.appsRepo.updateApp(id, data)
  }

  async getAppSyncStatus(id: string): Promise<AppSyncStatusDto | null> {
    const app = await this.getById(id)
    if (!app) {
      return null
    }

    return {
      id: app.id,
      appId: app.appId,
      name: app.name,
      isSynced: !!app.data,
      numActions: app.data
        ? ((app.data as Prisma.JsonObject)['actions'] as Prisma.JsonArray)
            .length
        : undefined,
    }
  }

  async createNewApiKey(id: string): Promise<string> {
    const newKey = await this.generateNewApiKey(id)
    await this.appsRepo.updateApp(id, { apiKey: newKey })
    return newKey
  }

  private generateNewAppId(accountId: string): string {
    const currTimeMillis = new Date().getTime()
    const key = createHash('md5')
      .update(`${accountId}.${currTimeMillis}`)
      .digest('hex')
    return key
  }

  private async generateNewApiKey(appId: string): Promise<string> {
    const currTimeMillis = new Date().getTime()
    const key = createHash('sha256')
      .update(`${appId}.${currTimeMillis}`)
      .digest('hex')
    return key
  }

  async updateAppData(id: string, data: { [key: string]: any }): Promise<App> {
    return this.appsRepo.updateAppData(id, { ...data })
  }

  async syncApp(appId: string, data: AgentSyncDto): Promise<void> {
    const newDataHashBuilder = createHash('sha256')
    newDataHashBuilder.update(data.sdkVersion).update(`${data.requiresAuth}`)

    for (const action of data.actions) {
      newDataHashBuilder
        .update(action.name)
        .update(action.description ?? '')
        .update(`${action.stealth ?? false}`)
        .update(`${action.paged ?? false}`)
      for (const param of action.parameters) {
        newDataHashBuilder.update(param.name).update(param.type)
      }
    }
    const newDataHash = newDataHashBuilder.digest('hex')

    const existingApp = await this.appsRepo.findByAppId({ appId })
    if (!existingApp) {
      throw new AppNotFoundException()
    }

    const isFirstSync = !existingApp.isDefault && existingApp.data === null

    let shouldUpdateData = true
    if (existingApp.data) {
      const oldDataHashBuilder = createHash('sha256')

      const existingData = existingApp.data as { [Key in string]?: any }
      oldDataHashBuilder
        .update(existingData.sdkVersion)
        .update(`${existingData.requiresAuth}`)

      const actions = existingData.actions as Array<any>
      for (let action of actions) {
        action = action as { [Key in string]?: any }
        oldDataHashBuilder
          .update(action.name)
          .update(action.description ?? '')
          .update(`${action.stealth ?? false}`)
          .update(`${action.paged ?? false}`)
        for (const param of action.parameters) {
          oldDataHashBuilder.update(param.name).update(param.type)
        }
      }
      const existingDataHAsh = oldDataHashBuilder.digest('hex')
      if (newDataHash === existingDataHAsh) {
        shouldUpdateData = false
      }
    }

    if (shouldUpdateData) {
      const actions = await this.generateEmbeddings(data)
      const dataToUpdate = { ...data, actions }
      await this.appsRepo.updateAppData(existingApp.id, dataToUpdate)
    }

    if (isFirstSync) {
      this.analyticsEventTracker.trackEvent(APP_SYNCED_EVENT, {
        ...existingApp,
        accountId: existingApp.creatorId,
      })

      const event: AppSyncedEventPayload = {
        accountId: existingApp.creatorId,
        ...existingApp,
      }
      this.eventBus.emit(FIRST_APP_SYNCED_EVENT, event)
    }
  }

  async generateEmbeddings(data: AgentSyncDto): Promise<Action[]> {
    return Promise.all(
      data.actions.map(async (action) => {
        const desc = action.description

        if (!desc) {
          throw new Error('Action Description is required')
        }

        const embeddings = await this.embeddingService.getEmbeddings([desc])
        const descriptionEmbedding = embeddings[0]

        const a = {
          ...action,
          descriptionEmbedding: descriptionEmbedding.embedding,
        }
        return a
      })
    )
  }

  async deleteApp(id: string): Promise<boolean> {
    const app = await this.appsRepo.findById(id)
    if (!app) {
      throw new AppNotFoundException()
    }

    const res = await this.appsRepo.deleteById(id)
    return !!res
  }

  // TODO: DELETE THIS AFTER CLEANING UP APP HANDLES IN PROD
  async getAllApps(): Promise<App[]> {
    return this.appsRepo.getAllApps()
  }
}
