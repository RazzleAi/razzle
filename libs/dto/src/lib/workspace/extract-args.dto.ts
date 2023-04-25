export interface ExtractArgsResponseDto {
  actionName: string
  args: ExtractArgsResponseArgsDto[]
}

export interface ExtractArgsResponseArgsDto {
  argName: string
  type: string
  value: any
}

export interface ActionPlanWithDetailsDto {
  uuid: string
  appId: string
  appName: string
  appDescription: string
  userId?: string
  actionName: string
  actionDescription?: string
  args: {
    name: string
    value: string | ActionPlanWithDetailsDto
    type: string
  }[]
  isError?: boolean
  errorMessage?: string
}
