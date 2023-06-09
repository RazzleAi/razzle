import { UserAppAuthentication } from './types'

export interface UserAppAuthenticationRepo {
  findByUserIdAndAppId(
    userId: string,
    appId: string
  ): Promise<UserAppAuthentication | null>

  findByUserIdAndAppIdAuthenticated(
    userId: string,
    appId: string
  ): Promise<UserAppAuthentication | null>

  save(authentication: UserAppAuthentication): Promise<UserAppAuthentication>
}
