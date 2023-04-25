import { CanActivate, ExecutionContext, Injectable, Logger } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { UserServiceImpl } from '../../user/user.service.impl'
import { AuthServiceImpl } from '../auth.service-impl'
import { AuthenticatedRequest } from '../authenticated-request'
import { SKIP_AUTH_KEY } from '../decorators/no-auth.decorator'

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name)

  constructor(
    private reflector: Reflector,
    private authService: AuthServiceImpl,
    private userService: UserServiceImpl
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    try {
      const shouldSkipAuth = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
        context.getHandler(),
        context.getClass(),
      ])

      if (shouldSkipAuth) {
        return true
      }

      const accessToken = request.header('Authorization')
      if (!accessToken) {
        this.logger.error('No access token in request. Returning 401')
        return false
      }

      const bearerToken = accessToken.replace('Bearer', '').trim()
      const decodedToken = await this.authService.verifyAuthToken(bearerToken)

      const user = await this.userService.getUserByAuthUid(decodedToken.uid)
      if (!user) {
        this.logger.error('Error: User not found for authId and email', {
          authId: decodedToken.uid,
          email: decodedToken.email,
        })
        return false
      }

      const authenticatedRequest = request as AuthenticatedRequest
      authenticatedRequest.decodedToken = decodedToken
      authenticatedRequest.user = user

      // TODO: validate permissions
      return true
    } catch (error) {
      this.logger.error('Error occurred while parsing firebase auth token', error)
    }
  }
}
