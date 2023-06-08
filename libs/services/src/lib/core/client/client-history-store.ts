import { ClientHistoryItemDto } from '@razzle/dto'

export interface ClientHistoryStore {
  addToHistoryForClient(
    clientId: string,
    item: ClientHistoryItemDto
  ): Promise<void>
  getHistoryForClient(
    clientId: string,
    count: number
  ): Promise<ClientHistoryItemDto[]>
  getFramedHistoryItemsForClient(
    clientId: string,
  ): Promise<ClientHistoryItemDto[]>
  replaceHistoryItem(
    clientId: string,
    oldItem: ClientHistoryItemDto,
    newItem: ClientHistoryItemDto
  ): Promise<void>
}
