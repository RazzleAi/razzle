import {
  IsNotEmpty,
  Validator,
  IsArray,
  ValidateNested,
  IsOptional,
  IsBoolean,
  IsString,
} from 'class-validator'
import { plainToClass, Type } from 'class-transformer'

export class AgentSyncDtoValidator {
  async validateData(
    data: AgentSyncDto
  ): Promise<{ valid: boolean; error?: string }> {
    data = plainToClass(AgentSyncDto, data)
    const v = new Validator()
    const result = await v.validate(data)
    if (result.length > 0) {
      if (!result[0].constraints) {
        return { valid: false, error: 'An unknown validation error occurred' }
      }
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const keys = Object.keys(result[0].constraints!)
      if (keys.length === 0) {
        return { valid: false, error: 'An unknown validation error occurred' }
      }

      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      const error = result[0].constraints![keys[0]]
      return { valid: false, error }
    }

    return { valid: true }
  }
}

export class AgentSyncExampleDto {
  @IsNotEmpty()
  title: string

  @IsArray()
  args: string[]
}

export class AgentSyncExampleDtoWithEmbedings {
  title: string
  args: string[]
  embedings: number[]
}

export class AgentSyncActionParametersDto {
  @IsNotEmpty()
  name: string

  @IsNotEmpty()
  type: string
}

export class AgentSyncActionsDto {
  @IsNotEmpty()
  name: string

  @IsString()
  @IsNotEmpty()
  description: string

  @IsBoolean()
  @IsOptional()
  stealth?: boolean

  @IsBoolean()
  @IsOptional()
  paged?: boolean

  @Type(() => AgentSyncExampleDto)
  @ValidateNested()
  @IsArray()
  @IsOptional()
  examples: AgentSyncExampleDto[] | AgentSyncExampleDtoWithEmbedings[]

  @Type(() => AgentSyncActionParametersDto)
  @ValidateNested()
  @IsArray()
  @IsOptional()
  parameters: AgentSyncActionParametersDto[]
}

export class AgentSyncDto {
  @IsNotEmpty()
  sdkVersion: string

  @Type(() => AgentSyncActionsDto)
  @ValidateNested()
  @IsArray()
  actions!: AgentSyncActionsDto[]

  @IsBoolean()
  requiresAuth: boolean
}
