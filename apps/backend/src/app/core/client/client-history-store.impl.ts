import { Injectable, Logger } from '@nestjs/common'
import {
  ClientHistoryItemWithMessage,
  ClientHistoryRepoImpl,
} from './client-history.repo'
import { ClientHistoryItemDto } from '@razzle/dto'
import { ClientHistoryStore } from '@razzle/services'

@Injectable()
export class ClientHistoryStoreImpl implements ClientHistoryStore {
  private logger = new Logger(ClientHistoryStoreImpl.name)
  private static readonly MAX_HISTORY_ITEMS = 50

  constructor(
    private readonly redisClient: RedisClient,
    private readonly clientHistoryRepo: ClientHistoryRepoImpl
  ) {}

  getClientHistoryKey(clientId: string): string {
    return `razzle:client-history:${clientId}`
  }

  async addToHistoryForClient(clientId: string, item: ClientHistoryItemDto) {
    const createdItem = await this.clientHistoryRepo.createClientHistoryItem(
      clientId,
      item
    )

    // save to redis, redis should only store the last 50 items
    const clientHistoryKey = this.getClientHistoryKey(clientId)
    const redisQueue = new RedisBoundedList(
      this.redisClient,
      clientHistoryKey,
      ClientHistoryStoreImpl.MAX_HISTORY_ITEMS
    )

    const historyItem = this.clientHistoryItemToDto(createdItem)
    await redisQueue.push(JSON.stringify(historyItem))
  }

  async getHistoryForClient(
    clientId: string,
    count: number
  ): Promise<ClientHistoryItemDto[]> {
    const itemsFromCache = await this.getItemsFromCache(clientId)
    if (count > itemsFromCache.length) {
      const itemsFromDb = await this.getItemsFromDb(clientId, count)
      const allItems = [...itemsFromCache, ...itemsFromDb]
      return allItems.filter((item, index) => {
        return allItems.findIndex((i) => i.hash === item.hash) === index
      })
    }

    return itemsFromCache
  }

  async getFramedHistoryItemsForClient(
    clientId: string
  ): Promise<ClientHistoryItemDto[]> {
    const itemsFromDb = await this.clientHistoryRepo.getAllFramedByClientId(
      clientId
    )
    return itemsFromDb.map((item) => this.clientHistoryItemToDto(item))
  }

  async replaceHistoryItem(
    clientId: string,
    oldItem: ClientHistoryItemDto,
    newItem: ClientHistoryItemDto
  ): Promise<void> {
    // find and replace in db
    await this.clientHistoryRepo.updateClientHistoryItem(oldItem.id, newItem)
    const updatedItemsForCache = await this.getItemsFromDb(
      clientId,
      ClientHistoryStoreImpl.MAX_HISTORY_ITEMS
    )

    // get last 50 items from db and update cache
    const clientHistoryKey = this.getClientHistoryKey(clientId)
    const redisQueue = new RedisBoundedList(
      this.redisClient,
      clientHistoryKey,
      ClientHistoryStoreImpl.MAX_HISTORY_ITEMS
    )
    await redisQueue.clear()
    await redisQueue.pushMany(
      updatedItemsForCache.map((item) => JSON.stringify(item))
    )
  }

  private async getItemsFromDb(
    clientId: string,
    count: number
  ): Promise<ClientHistoryItemDto[]> {
    const items = await this.clientHistoryRepo.getAllByClientId(clientId, count)
    return items.map((item) => this.clientHistoryItemToDto(item))
  }

  private async getItemsFromCache(
    clientId: string
  ): Promise<ClientHistoryItemDto[]> {
    const clientHistoryKey = this.getClientHistoryKey(clientId)
    const redisQueue = new RedisBoundedList(
      this.redisClient,
      clientHistoryKey,
      ClientHistoryStoreImpl.MAX_HISTORY_ITEMS
    )

    const items = await redisQueue.getItems()
    const dtos = items
      .map((item) => JSON.parse(item))
      .sort((a: ClientHistoryItemDto, b: ClientHistoryItemDto) => {
        if (a.timestampMillis === b.timestampMillis) {
          return a.message.__objType__ === 'ClientMessage' ? -1 : 1
        }
        return a.timestampMillis - b.timestampMillis
      })
    return dtos
  }

  private clientHistoryItemToDto(
    item: ClientHistoryItemWithMessage
  ): ClientHistoryItemDto {
    return {
      id: item.id,
      hash: item.hash,
      isFramed: item.isFramed,
      message: item.messageVal,
      timestampMillis: item.timestampMillis,
    }
  }
}
