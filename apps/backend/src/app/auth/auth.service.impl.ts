import { AuthService } from '@razzle/services'
import { Injectable } from '@nestjs/common'
import { UserServiceImpl } from '../user/user.service.impl'
import { AuthRepoImpl } from './auth.repo'
import { AccountServiceImpl } from '../account/account.service-impl'
import { AccountUserInviteTokenRepoImpl } from '../account/account-user-invite-token-repo-impl'

@Injectable()
export class AuthServiceImpl extends AuthService {
  constructor(
    authRepository: AuthRepoImpl,
    userServiceImpl: UserServiceImpl,
    accountServiceImpl: AccountServiceImpl,
    accountUserInviteRepository: AccountUserInviteTokenRepoImpl
  ) {
    super(
      authRepository,
      userServiceImpl,
      accountServiceImpl,
      accountUserInviteRepository
    )
  }
}
