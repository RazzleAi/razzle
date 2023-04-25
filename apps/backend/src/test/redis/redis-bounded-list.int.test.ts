import { RedisClient } from '../../app/redis/redis-client'
import { RedisBoundedList } from '../../app/redis/redis-bounded-list'
import { TestEnvironment } from '../containers/test-environment'

describe('RedisBoundedList', () => {
  let redisClient: RedisClient
  let testEnvironment: TestEnvironment
  
  beforeAll(async () => {
    testEnvironment = new TestEnvironment()
    await testEnvironment.startTestContainers()
    redisClient = testEnvironment.getRedisClient()
  })

  afterAll(async () => {
    await testEnvironment.shutdownTestContainers()
  })

  afterEach(async () => {
    await redisClient.flushall()
  })

  it('should be defined', () => {
    expect(redisClient).toBeDefined()
  })

  it('should be able to push and pop', async () => {
    const queue = new RedisBoundedList(redisClient, 'test-queue')
    await queue.push('test-item-1')
    await queue.push('test-item-2')

    const item1 = await queue.pop()
    expect(item1).toEqual('test-item-2')

    const item2 = await queue.pop()
    expect(item2).toEqual('test-item-1')
  })

  it('should be able to push and pop with max size', async () => {
    const queue = new RedisBoundedList(redisClient, 'test-queue', 2)
    await queue.push('test-item-1')
    await queue.push('test-item-2')
    await queue.push('test-item-3')

    const item1 = await queue.pop()
    expect(item1).toEqual('test-item-3')

    const item2 = await queue.pop()
    expect(item2).toEqual('test-item-2')

    const item3 = await queue.pop()
    expect(item3).toBeNull()
  })

  it('should be able to return the items', async () => {
    const queue = new RedisBoundedList(redisClient, 'test-queue', 2)
    await queue.push('test-item-1')
    await queue.push('test-item-2')
    await queue.push('test-item-3')

    const items = await queue.getItems()
    expect(items).toEqual(['test-item-3', 'test-item-2'])
  })

  afterAll(async () => {
    await redisClient.quit()
  })
})
