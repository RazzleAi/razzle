import { Injectable } from '@nestjs/common'
import { UserAppAuthenticationRepoImpl } from './user-app-authentication.repo'
import { UserAppAuthentication } from '@razzle/services'

export interface UserAppAuthenticationHandler {
  handleUserAppAuthenticationUpdate(userId: string, appId: string)
}

@Injectable()
export default class UserAppAuthenticationHandlerImpl
  implements UserAppAuthenticationHandler
{
  constructor(
    private userAppAuthenticationRepo: UserAppAuthenticationRepoImpl
  ) {}

  async handleUserAppAuthenticationUpdate(
    userId: string,
    appId: string
  ): Promise<UserAppAuthentication> {
    const existingAuthentication =
      await this.userAppAuthenticationRepo.findByUserIdAndAppIdAuthenticated(
        userId,
        appId
      )

    if (existingAuthentication) {
      return
    }

    return this.userAppAuthenticationRepo.save({
      appId,
      userId,
      authenticated: true,
    } as UserAppAuthentication)
  }
}
