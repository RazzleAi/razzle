import { AgentSyncDto } from '@razzle/dto'
import { AppsService } from '../../apps'
import {
  AppSyncedEventPayload,
  EventBus,
  FIRST_APP_SYNCED_EVENT,
} from '../../tools'
import { APP_SYNCED_EVENT, AnalyticsEventTracker } from '../../tools/analytics'
import { createHash } from 'crypto'
import { NotFoundException } from '@nestjs/common'

export class AgentSyncService {
  constructor(
    private readonly appsService: AppsService,
    private readonly eventBus: EventBus,
    private readonly analyticsEventTracker: AnalyticsEventTracker
  ) {}
  async syncAgent(appId: string, data: AgentSyncDto): Promise<void> {
    const newDataHashBuilder = createHash('sha256')
    newDataHashBuilder.update(data.sdkVersion).update(`${data.requiresAuth}`)

    console.log(
      'AgentSyncService: Syncing agent for app: ',
      JSON.stringify(data)
    )

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

    const existingApp = await this.appsService.findById(appId)
    if (!existingApp) {
      throw new NotFoundException()
    }

    const isFirstSync = !existingApp.isDefault && existingApp.data === null

    let shouldUpdateData = true
    if (existingApp.data) {
      const oldDataHashBuilder = createHash('sha256')

      const existingData = existingApp.data
      oldDataHashBuilder
        .update(existingData.sdkVersion)
        .update(`${existingData.requiresAuth}`)

      const actions = existingData.actions as Array<any>
      if (actions) {
        for (const action of actions) {
          oldDataHashBuilder
            .update(action.name)
            .update(action.description ?? '')
            .update(`${action.stealth ?? false}`)
            .update(`${action.paged ?? false}`)
          for (const param of action.parameters) {
            oldDataHashBuilder.update(param.name).update(param.type)
          }
        }
      }
      const existingDataHAsh = oldDataHashBuilder.digest('hex')
      if (newDataHash === existingDataHAsh) {
        shouldUpdateData = false
      }
    }

    if (shouldUpdateData) {
      const actions = await this.appsService.generateEmbeddings(data)
      const dataToUpdate = { ...data, actions }
      await this.appsService.updateAppData(existingApp.id, dataToUpdate)
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
}
