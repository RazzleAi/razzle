import { IsNotEmpty, IsString } from 'class-validator'

export class StepDto {
  @IsNotEmpty()
  id: number

  @IsString()
  thought?: string

  @IsNotEmpty()
  actionName: string

  @IsNotEmpty()
  actionInput: ActionInput[]

  @IsNotEmpty()
  appName: string

  @IsNotEmpty()
  razzleAppId: string

  @IsNotEmpty()
  appId: string

  appDescription?: string

  @IsNotEmpty()
  actionDescription: string

  containsOutputHallucination?: boolean

  isError?: boolean
  errorMessage?: string
}

export class ActionInput {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  value: string | null

  @IsNotEmpty()
  type: string
}
