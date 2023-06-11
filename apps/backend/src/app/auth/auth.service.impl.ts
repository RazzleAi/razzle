import { AuthService } from '@razzle/services'
import { Injectable } from '@nestjs/common'
import { UserServiceImpl } from '../user/user.service.impl'
import { AuthRepoImpl } from './auth.repo'
import { AccountServiceImpl } from '../account/account.service-impl'
import { AccountInvitationRepoImpl } from '../account/account-invitation.repo.impl'

@Injectable()
export class AuthServiceImpl extends AuthService {
  constructor(
    authRepository: AuthRepoImpl,
    userServiceImpl: UserServiceImpl,
    accountServiceImpl: AccountServiceImpl,
    accountInviteRepo: AccountInvitationRepoImpl
  ) {
    super(
      authRepository,
      userServiceImpl,
      accountServiceImpl,
      accountInviteRepo
    )
  }
}
