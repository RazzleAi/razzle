import { Injectable } from '@nestjs/common'
import { ClientToServerMessage, ClientRequest } from '@razzle/dto'
import { AuthServiceImpl } from '../../auth/auth.service.impl'
import { UserServiceImpl } from '../../user/user.service.impl'
import { ClientRequestValidator, User } from '@razzle/services'

@Injectable()
export class ClientRequestValidatorImpl implements ClientRequestValidator {
  constructor(
    private readonly authService: AuthServiceImpl,
    private readonly userService: UserServiceImpl
  ) {}

  async validateRequest(
    request: ClientToServerMessage<ClientRequest>
  ): Promise<User | null> {
    if (!request.data) {
      console.error('No request data')
      return null
    }
    if (!request.data.headers) {
      console.error('No headers in request')
      return null
    }

    const headers = request.data.headers
    const accessToken = headers['accessToken'] as string
    if (!accessToken) {
      console.error('No access token in request. Returning 401')
      return null
    }

    try {
      const decodedToken = await this.authService.verifyAuthToken(accessToken)
      const user = await this.userService.getUserByAuthUid(decodedToken.uid)
      if (!user) {
        console.error('Error: User not found for authId and email', {
          authId: decodedToken.uid,
          email: decodedToken.email,
        })
        return null
      }
      return user
    } catch (err) {
      return null
    }
  }
}
