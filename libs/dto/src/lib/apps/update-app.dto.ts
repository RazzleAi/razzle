import { IsBoolean, IsOptional, IsString } from 'class-validator'

export class UpdateAppDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean
}
