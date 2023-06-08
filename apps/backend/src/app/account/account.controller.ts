import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
  NotFoundException,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common'
import {
  AccountDtoWithMemberCountDto,
  AccountWithOwnerDto,
  AppDto,
  AppDtoWithApiKey,
  CreateAccountDto,
  OnboardingDto,
  Page,
  UpdateOnboardingDto,
} from '@razzle/dto'
import {
  AccountWithUser,
  DuplicateMatchDomainException,
  User,
} from '@razzle/services'
import { Principal, PrincipalKey } from '../auth/decorators'
import { ExceptionResponse, UseExceptionResponseHandler } from '../decorators'
import { OnboardingServiceImpl } from '../onboarding'
import { AccountServiceImpl } from './account.service-impl'

@UseExceptionResponseHandler()
@Controller('account')
export class AccountController {
  private readonly logger = new Logger(AccountController.name)
  constructor(
    private readonly accountService: AccountServiceImpl,
    private readonly onboardingService: OnboardingServiceImpl
  ) {}

  @Post()
  @HttpCode(201)
  @ExceptionResponse({
    types: [DuplicateMatchDomainException],
    statusCode: HttpStatus.CONFLICT,
    message: 'An account with this domain already exists',
  })
  createAccount(
    @Principal(PrincipalKey.UserId) userId: string,
    @Body() createAccountDto: CreateAccountDto
  ) {
    if (!createAccountDto.userId) {
      createAccountDto.userId = userId
    }

    return this.accountService.createAccount(
      createAccountDto.userId,
      createAccountDto
    )
  }

  @Post('/:accountId/users')
  @HttpCode(201)
  addUserToAccount(
    @Param('accountId') accountId: string,
    @Principal(PrincipalKey.UserId) userId: string
  ) {
    return this.accountService.addUserToAccount(userId, accountId)
  }

  @Delete('/internal/:accountId/users/:userId')
  async removeUserFromAccount(
    @Param('accountId') accountId: string,
    @Param('userId') userId: string
  ): Promise<boolean> {
    const res = await this.accountService.removeUserFromAccount(
      userId,
      accountId
    )
    return res
  }

  @Get('/internal/user-accounts/:accountId/:userId')
  async getUserAccount(
    @Param('accountId') accountId: string,
    @Param('userId') userId: string
  ): Promise<AccountWithOwnerDto> {
    const res = await this.accountService.findAccountUserWithOwner(
      accountId,
      userId
    )
    return res
  }

  @Post('/internal/:accountId/users/:userId/invitations')
  async inviteUserToAccount(
    @Param('accountId') accountId: string,
    @Param('userId') userId: string,
    @Query('email') email: string
  ): Promise<void> {
    const accountUser = await this.accountService.findAccountUser(
      accountId,
      userId
    )
    if (!accountUser) {
      throw new HttpException(
        `Account User not found, Account ID: ` +
          accountId +
          `, User ID: ` +
          userId,
        HttpStatus.NOT_FOUND
      )
    }
    return this.accountService.inviteUserToAccount(accountUser, email)
  }

  @Get(':id/users')
  async getAccountMembers(
    @Param('id') id: string,
    @Query('count') count?: number,
    @Query('cursor') cursor?: string
  ): Promise<Page<AccountWithUser>> {
    return this.accountService.getUsersInAccount(id, {
      cursor: cursor,
      limit: count || 10,
    })
  }

  @Get('/internal/:id/all-users')
  async getAllAccountMembers(@Param('id') id: string): Promise<User[]> {
    const res = await this.accountService.getAllUsersInAccount(id)
    return res
  }

  @Get('user')
  async getAccountsForUser(
    @Principal(PrincipalKey.UserId) userId: string
  ): Promise<AccountDtoWithMemberCountDto[]> {
    const accounts = await this.accountService.getUserAccounts(userId)
    return accounts
  }

  @Get(':id')
  async getAccountById(
    @Param('id') accountId: string
  ): Promise<AccountWithOwnerDto> {
    const account = await this.accountService.getById(accountId)
    return {
      id: account.id,
      name: account.name,
      owner: account.owner,
    }
  }

  @Get('/:accountId/apps')
  async getAppsInAccount(
    @Param('accountId') accountId: string
  ): Promise<AppDto[]> {
    return await this.accountService.getAppsInAccount(accountId)
  }

  @Get('/:accountId/apps/unsynced')
  async getUnsyncedAppsInAccount(
    @Param('accountId') accountId: string
  ): Promise<AppDtoWithApiKey[]> {
    return await this.accountService.getUnsyncedAppsInAccount(accountId)
  }

  @ExceptionResponse({
    types: [NotFoundException],
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'This app does not exist',
  })
  @Post('/:accountId/apps/:appId')
  async addAppToAccount(
    @Param('accountId') accountId: string,
    @Param('appId') appId: string
  ): Promise<AppDto> {
    return await this.accountService.addAppToAccount(accountId, appId)
  }

  @Get('/:accountId/apps/:appId/exists')
  async isAppInAccount(
    @Param('accountId') accountId: string,
    @Param('appId') appId: string
  ): Promise<boolean> {
    return await this.accountService.isAppInAccount(accountId, appId)
  }

  @ExceptionResponse({
    types: [NotFoundException],
    statusCode: HttpStatus.BAD_REQUEST,
    message: 'This app does not exist',
  })
  @Delete('/:accountId/apps/:appId')
  async removeAppFromAccount(
    @Param('accountId') accountId: string,
    @Param('appId') appId: string
  ): Promise<boolean> {
    return await this.accountService.removeAppFromAccount(accountId, appId)
  }

  @Get('/:accountId/onboarding')
  async getOnboardingStatus(
    @Param('accountId') accountId: string
  ): Promise<OnboardingDto> {
    return await this.onboardingService.findByAccountId(accountId)
  }

  @Put('/:accountId/onboarding')
  async updateOnboardingStatus(
    @Param('accountId') accountId: string,
    @Body() data: UpdateOnboardingDto
  ) {
    return await this.onboardingService.updateOnboardingByAccountId(
      accountId,
      data
    )
  }
}
