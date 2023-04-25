import { IsBoolean, IsDefined, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateAppDto {

  @IsNotEmpty()
  @IsString()
  name: string

  @IsNotEmpty()
  @IsString()
  description: string

  @IsNotEmpty()
  @IsString()
  @IsDefined()
  accountId: string

  @IsString()
  @IsOptional()
  iconUrl: string | null

  @IsBoolean()
  isPublic: boolean

  @IsString()
  handle: string
}

export interface CreateAppResponseDto {
  id: string
  appId: string
  name: string
  apiKey: string
  description: string
  isPublic: boolean
  handle: string | null
}
