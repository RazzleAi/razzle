import { Account } from '@prisma/client'
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

export type CreateAccountResponseDto = Omit<Account, 'createdAt' | 'updatedAt'>
