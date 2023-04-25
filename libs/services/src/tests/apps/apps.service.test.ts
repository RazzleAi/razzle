import { AppsRepo } from '../../lib/apps/apps.repo'
import { AppsService } from '../../lib/apps/apps.service'
import { EmbeddingService } from '../../lib/ml'
import { createMock } from '@golevelup/ts-jest'
import { App } from '@prisma/client'
import { v4 as uuid } from 'uuid'
import { CreateAppDto } from '@razzle/dto'
import { NewAppDetails } from '../../lib/apps/apps.repo'

describe('AppsService tests', () => {
  let appsService: AppsService
  let appsRepo: AppsRepo
  let embeddingService: EmbeddingService

  let mockCreatedApp: App

  beforeEach(() => {
    appsRepo = createMock<AppsRepo>()
    embeddingService = createMock<EmbeddingService>()
    appsService = new AppsService(appsRepo, embeddingService)

    mockCreatedApp = {
      id: 'mock-id',
      appId: 'mock-app-id',
      apiKey: uuid(),
      name: 'mock-app',
      description: 'a mock app',
      creatorId: uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
      data: {},
      iconUrl: '',
    }

    appsRepo.createApp = jest.fn().mockResolvedValue(mockCreatedApp)
  })

  it('should be able to create an app', async () => {
    appsRepo.findByAppId = jest.fn().mockResolvedValue(null)

    const accountId = uuid()
    const name = 'Test-app'
    const createAppDto: CreateAppDto = {
      accountId,
      description: 'test description',
      name,
      iconUrl: 'iconUrl',
    }

    const response = await appsService.createApp(accountId, createAppDto)

    expect(response).not.toBeNull()
    expect(response).toEqual(mockCreatedApp)

    expect(appsRepo.createApp).toBeCalledWith(
      accountId,
      expect.objectContaining({
        name: name,
        iconUrl: 'iconUrl',
        description: 'test description',
      })
    )
  })

})
