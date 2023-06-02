import { CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthPrincipal } from '@razzle/domain'
import { AuthenticatedRequest } from '../../app/auth/authenticated-request'
import { SKIP_AUTH_KEY } from '../../app/auth/decorators'
import { faker } from '@faker-js/faker'
import { PrismaService } from '../../app/prisma/prisma.service'

export class MockAuthGuard implements CanActivate {
  private reflector: Reflector

  constructor(private readonly prismaService: PrismaService) {
    this.reflector = new Reflector()
    this.reflector.getAllAndOverride = jest.fn().mockReturnValue(true)
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()

    const shouldSkipAuth = this.reflector.getAllAndOverride<boolean>(
      SKIP_AUTH_KEY,
      [context.getHandler(), context.getClass()]
    )

    if (shouldSkipAuth) {
      return true
    }

    const accessToken = request.header('Authorization')
    if (!accessToken) {
      return true
    }

    const bearerToken = accessToken.replace('Bearer', '').trim()

    const user = await this.prismaService.user.findUnique({
      where: {
        authUid: bearerToken,
      },
    })

    const principal: AuthPrincipal = {
      uid: user.authUid,
      email: user.email,
      aud: faker.datatype.uuid(),
      auth_time: parseInt(faker.random.numeric(9)),
      exp: parseInt(faker.random.numeric(9)),
      iat: parseInt(faker.random.numeric(9)),
      iss: faker.internet.url(),
      sub: faker.datatype.uuid(),
    }

    const authenticatedRequest = request as AuthenticatedRequest

    authenticatedRequest.decodedToken = principal
    authenticatedRequest.user = user
    return true
  }
}
