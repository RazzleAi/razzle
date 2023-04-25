export interface ActionPlanWithDetails {
  uuid: string
  appId: string
  appName: string
  appDescription: string
  actionName: string
  args: {
    name: string
    value: string | ActionPlanWithDetails
    type: string
  }[]
}
