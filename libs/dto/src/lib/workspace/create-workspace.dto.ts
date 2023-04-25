import { IsDefined, IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateWorkspaceDto {
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  @IsDefined()
  accountId: string

  @IsString()
  @IsOptional()
  description?: string

  @IsOptional()  
  isDefault?: boolean
}

export interface CreateWorkspaceResponseDto {
  id: string
  name: string
  description?: string
}
