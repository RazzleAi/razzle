import { UserDto } from "../user"

export interface MeResponseDto {
  userId: string
  authUid: string
  user: UserDto
}
