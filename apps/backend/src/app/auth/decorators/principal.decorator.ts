import { AuthPrincipal, User } from '@razzle/domain'
import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { AuthenticatedRequest } from '../authenticated-request'

export enum PrincipalKey {
  Email = 'email',
  UserId = 'userId',
  AuthUid = 'authUid',
  User = 'user',
}

export const Principal = createParamDecorator(
  (data: any, ctx: ExecutionContext): AuthPrincipal | string | User => {
    const request = ctx.switchToHttp().getRequest() as AuthenticatedRequest
    if (data && typeof data === 'string') {
      return getDataFromDecodedToken(data, request)
    }
    return request.decodedToken
  }
)

function getDataFromDecodedToken(
  key: string,
  request: AuthenticatedRequest
): string | AuthPrincipal | User {
  switch (key) {
    case PrincipalKey.Email.valueOf():
      return request.decodedToken.email || request.decodedToken
    case PrincipalKey.AuthUid:
      return request.decodedToken.uid
    case PrincipalKey.UserId:
      return request.user.id
    case PrincipalKey.User.valueOf():
      return request.user
    default:
      return request.decodedToken
  }
}
