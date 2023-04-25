export interface AppSyncStatusDto {
    id: string
    appId: string
    name: string
    isSynced: boolean
    numActions?: number
}