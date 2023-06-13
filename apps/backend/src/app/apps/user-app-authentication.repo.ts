import { Injectable } from '@nestjs/common'
import { UserAppAuthenticationRepo, UserAppAuthentication } from '@razzle/services'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class UserAppAuthenticationRepoImpl
  implements UserAppAuthenticationRepo
{
  constructor(private readonly prismaService: PrismaService) {}

  findByUserIdAndAppId(
    userId: string,
    appId: string
  ): Promise<UserAppAuthentication> {
    return this.prismaService.userAppAuthentication.findFirst({
      where: {
        userId: userId,
        app: {
          appId,
        },
      },
    })
  }

  findByUserIdAndAppIdAuthenticated(
    userId: string,
    appId: string
  ): Promise<UserAppAuthentication> {
    return this.prismaService.userAppAuthentication.findFirst({
      where: {
        userId: userId,
        app: {
          appId,
        },
        authenticated: true,
      },
    })
  }

  save(authentication: UserAppAuthentication): Promise<UserAppAuthentication> {
    return this.prismaService.userAppAuthentication.create({
      data: authentication,
    })
  }
}
