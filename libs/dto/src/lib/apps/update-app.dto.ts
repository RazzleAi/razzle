import { IsOptional, IsString } from 'class-validator'

export class UpdateAppDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  description?: string
}
