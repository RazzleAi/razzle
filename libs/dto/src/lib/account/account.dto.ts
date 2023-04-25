import { UserDto } from '../user'

export interface AccountDto {
  id: string
  name: string
}

export type AccountDtoWithMemberCountDto = AccountDto & {
  memberCount: number
}

export type AccountWithOwnerDto = AccountDto & {
  owner: UserDto
}
