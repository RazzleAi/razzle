import {
  IsBoolean,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator'

export class CreateAccountDto {
  @IsOptional()
  userId?: string

  @IsDefined()
  @IsNotEmpty()
  @IsString()
  name: string

  @IsBoolean()
  enableDomainMatching: boolean

  @IsOptional()
  matchDomain?: string
}

export type AccountAppDto = {
  appId: string
  dateAdded: Date
}

export type CreateAccountResponseDto = {
  id: string
  name: string
  matchDomain?: string
  enableDomainMatching: boolean
  accountApps: AccountAppDto[]
}
