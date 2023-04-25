export interface WorkspaceActionDto {
  workspaceId: string  
  actionName: string
  actionDescription?: string
  appId: string
  razzleAppId: string
  appName: string
  appDescription?: string
  parameters: {
    name: string
    type: string    
  }[]
}
