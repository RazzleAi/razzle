import { ClientHistoryItemDto } from '@razzle/dto'

export interface ClientHistoryStore {
  addToHistoryForClient(
    clientId: string,
    workspaceId: string,
    item: ClientHistoryItemDto
  ): Promise<void>
  getHistoryForClient(
    clientId: string,
    workspaceId: string,
    count: number
  ): Promise<ClientHistoryItemDto[]>
  getFramedHistoryItemsForClient(
    clientId: string,
    workspaceId: string,
  ): Promise<ClientHistoryItemDto[]>
  replaceHistoryItem(clientId: string, workspaceId: string, oldItem: ClientHistoryItemDto, newItem: ClientHistoryItemDto): Promise<void>
  countAllByWorkspaceId(workspaceId: string): Promise<number>
}
