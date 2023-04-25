import { ClientHistoryItemDto } from '@razzle/dto'
import { ClientHistoryRepoImpl } from '../../app/client/client-history.repo-impl'
import { Md5 } from 'ts-md5'
import { PrismaService } from '../../app/prisma/prisma.service'
import { TestEnvironment } from '../containers/test-environment'

describe('ClientHistoryRepoImpl', () => {
  let clientHistoryRepo: ClientHistoryRepoImpl
  let prismaService: PrismaService
  let testEnvironment: TestEnvironment

  beforeAll(async () => {
    testEnvironment = new TestEnvironment()
    await testEnvironment.startTestContainers()
    prismaService = testEnvironment.getMongoClient()
    clientHistoryRepo = new ClientHistoryRepoImpl(prismaService)
  })

  afterEach(async () => {
    await prismaService.clientHistoryItem.deleteMany({})
  }, 20000)

  afterAll(async () => {
    await testEnvironment.shutdownTestContainers()
  })

  it('should be able to create a client history', async () => {
    const clientId = new Md5().end() as string
    const workspaceId = new Md5().end() as string
    const testAppId = new Md5().end() as string
    const timestampMillis = Date.now()

    const item: ClientHistoryItemDto = {
      hash: new Md5().end() as string,
      message: {
        __objType__: 'ClientMessage',
        type: 'CallAction',
        data: { action: 'test-action', appId: testAppId, args: [] },
      },
      timestampMillis: timestampMillis,
    }

    const result = await clientHistoryRepo.createClientHistoryItem(
      clientId,
      workspaceId,
      item
    )

    expect(result).toBeDefined()
    expect(result.id).toBeDefined()
    expect(result.clientId).toEqual(clientId)
    expect(result.hash).toEqual(item.hash)
    expect(result.message).toEqual(item.message)
    expect(result.timestampMillis).toEqual(item.timestampMillis)
  })

  it('should be able to get all client history items', async () => {
    const clientId = new Md5().end() as string
    const workspaceId = new Md5().end() as string
    const testAppId = new Md5().end() as string
    const timestampMillis1 = Date.now()
    const timestampMillis2 = Date.now()

    const item1: ClientHistoryItemDto = {
      hash: new Md5().end() as string,
      message: {
        __objType__: 'ClientMessage',
        type: 'CallAction',
        data: { action: 'test-action', appId: testAppId, args: [] },
      },
      timestampMillis: timestampMillis1,
    }

    const item2: ClientHistoryItemDto = {
      hash: new Md5().end() as string,
      message: {
        __objType__: 'ClientMessage',
        type: 'CallAction',
        data: { action: 'test-action', appId: testAppId, args: [] },
      },
      timestampMillis: timestampMillis2,
    }

    await clientHistoryRepo.createClientHistoryItem(clientId, workspaceId, item1)
    await clientHistoryRepo.createClientHistoryItem(clientId, workspaceId, item2)

    const result = await clientHistoryRepo.getAllByClientIdAndWorkspaceId(clientId, workspaceId)

    expect(result).toBeDefined()
    expect(result.length).toEqual(2)

    // ordered in descending order
    expect(result[0].clientId).toEqual(clientId)
    expect(result[0].hash).toEqual(item2.hash)
    expect(result[0].message).toEqual(item2.message)
    expect(result[0].timestampMillis).toEqual(item2.timestampMillis)

    expect(result[1].clientId).toEqual(clientId)
    expect(result[1].hash).toEqual(item1.hash)
    expect(result[1].message).toEqual(item1.message)
    expect(result[1].timestampMillis).toEqual(item1.timestampMillis)
  })
})
