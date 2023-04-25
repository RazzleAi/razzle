import { ClientHistoryItemDto } from '@razzle/dto'
import { Md5 } from 'ts-md5'
import { ClientHistoryStore } from '../../app/client/client-history-store'
import { ClientHistoryRepoImpl } from '../../app/client/client-history.repo-impl'
import { PrismaService } from '../../app/prisma/prisma.service'
import { RedisBoundedList } from '../../app/redis/redis-bounded-list'
import { RedisClient } from '../../app/redis/redis-client'
import { TestEnvironment } from '../containers/test-environment'

describe('ClientHistoryStore', () => {
  let prismaService: PrismaService
  let clientHistoryStore: ClientHistoryStore
  let redisClient: RedisClient
  let clientHistoryRepo: ClientHistoryRepoImpl
  let testEnvironment: TestEnvironment

  beforeAll(async () => {
    jest.setTimeout(30000)
    testEnvironment = new TestEnvironment()
    await testEnvironment.startTestContainers()
    prismaService = testEnvironment.getMongoClient()
    clientHistoryRepo = new ClientHistoryRepoImpl(prismaService)

    prismaService = testEnvironment.getMongoClient()
    redisClient = testEnvironment.getRedisClient()

    clientHistoryRepo = new ClientHistoryRepoImpl(prismaService)
    clientHistoryStore = new ClientHistoryStore(redisClient, clientHistoryRepo)
  })

  afterAll(async () => {
    await testEnvironment.shutdownTestContainers()
  })

  afterEach(async () => {
    jest.setTimeout(30000)
    await prismaService.clientHistoryItem.deleteMany({})
    await redisClient.flushall()
  })
  
  it('should be able to add a client history item', async () => {
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

    await clientHistoryStore.addToHistoryForClient(
        clientId,
        workspaceId,
        item
    )

    const key = clientHistoryStore.getClientHistoryKey(clientId, workspaceId)
    const redisBoundedList = new RedisBoundedList(redisClient, key)
    const redisItem = await redisBoundedList.pop()
    expect(redisItem).toBeDefined()
    expect(redisItem).not.toBeNull()
    const foundItem = JSON.parse(redisItem) as ClientHistoryItemDto
    expect(foundItem.hash).toEqual(item.hash)
    expect(foundItem.message).toEqual(item.message)
    expect(foundItem.timestampMillis).toEqual(item.timestampMillis)

  })
})
