import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator'

export class ThirdPartyAuthDto {
  @IsNotEmpty()
  authUid: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  providerId: string

  @IsOptional()
  profilePictureUrl?: string
}

export class ThirdPartyAuthAccountInviteDto {
  @IsNotEmpty()
  authUid: string

  @IsNotEmpty()
  providerId: string

  @IsNotEmpty()
  @IsEmail()
  email: string

  @IsNotEmpty()
  token: string

  @IsOptional()
  profilePictureUrl?: string
}

export interface ThirdPartyAuthResponseDto {
  userId: string
  authUid: string
}
