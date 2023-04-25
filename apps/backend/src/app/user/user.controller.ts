import { Controller, Get, Query } from '@nestjs/common'
import { AppsServiceImpl } from '../apps/apps.service-impl'
import { Principal, PrincipalKey } from '../auth/decorators/principal.decorator'
import { UseExceptionResponseHandler } from '../decorators'
import { UserServiceImpl } from './user.service.impl'
import { UserDto } from '@razzle/dto'
import { App } from '@razzle/services'

@UseExceptionResponseHandler()
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserServiceImpl,
    private readonly appsService: AppsServiceImpl
  ) {}

  @Get('/search')
  async searchUsers(
    @Query('accountId') accountId: string,
    @Query('query') query: string
  ): Promise<UserDto[]> {
    return this.userService.searchInAccountByEmailOrUsername(accountId, query)
  }

  @Get('/:userId/apps')
  async getAppsForUser(
    @Principal(PrincipalKey.User) user: UserDto
  ): Promise<App[]> {
    return this.appsService.getAppsForUser(user.id)
  }
}
