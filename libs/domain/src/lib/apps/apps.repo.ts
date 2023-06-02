import { App, NewAppDetails, UpdateAppInput } from './types'

export interface AppsRepo {
  findById(id: string): Promise<App | null>
  findByAppId(props: { appId: string }): Promise<App | null>
  findNonDeletedByHandle(props: { handle: string }): Promise<App | null>
  findByHandle(props: { handle: string }): Promise<App | null>
  findPublicApps(): Promise<App[]>
  createApp(accountId: string, app: NewAppDetails): Promise<App>
  findAllByCreatorId(creatorId: string): Promise<App[]>
  setNewApiKey(props: { appId: string; apiKey: string }): Promise<App>
  getApiKeyForApp(props: { appId: string }): Promise<string>
  updateApp(id: string, data: UpdateAppInput): Promise<App>
  updateAppData(id: string, data: { [key: string]: any }): Promise<App>
  deleteById(id: string): Promise<App | null>
}
