import { ChatHistoryItem } from './chathistoryitem'

export interface IChat {
  chatId: string
  history: ChatHistoryItem[]
  initializationProps: {
    llm: {
      name: string
    } // llm names
    agents: string[] // agent ids
    accountId: string
    workspaceId: string
    userId: string
    clientId: string
  }
}
