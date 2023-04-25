import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Logger,
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
  WorkspaceDto,
} from '@razzle/dto'
import {
  AccountWithUser,
  DuplicateMatchDomainException,
} from '@razzle/services'
import { Principal, PrincipalKey } from '../auth/decorators'
import { ExceptionResponse, UseExceptionResponseHandler } from '../decorators'
import { OnboardingServiceImpl } from '../onboarding'
import { WorkspaceServiceImpl } from '../workspace/workspace.service-impl'
import { AccountServiceImpl } from './account.service-impl'

@UseExceptionResponseHandler()
@Controller('account')
export class AccountController {
  private readonly logger = new Logger(AccountController.name)
  constructor(
    private readonly accountService: AccountServiceImpl,
    private readonly onboardingService: OnboardingServiceImpl,
    private readonly workspaceService: WorkspaceServiceImpl
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

  @Get('/:accountId/unsynced-apps')
  async getUnsyncedAppsInAccount(
    @Param('accountId') accountId: string
  ): Promise<AppDtoWithApiKey[]> {
    return await this.accountService.getUnsyncedAppsInAccount(accountId)
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

  @Get('/:accountId/workspace')
  async getWorkspaceForUserAndAccount(
    @Principal(PrincipalKey.UserId) userId: string,
    @Param('accountId') accountId: string
  ): Promise<WorkspaceDto> {
    try {
      const workspaces = await this.workspaceService.getWorkspacesForAccount(
        accountId
      )
      if (workspaces.length === 0) {
        throw new HttpException(
          'no workspaces found for account ' + accountId,
          HttpStatus.NOT_FOUND
        )
      }

      const defaultWorkspace = workspaces.find((workspace) => {
        return workspace.isDefault
      })

      if (!defaultWorkspace) {
        throw new HttpException(
          'no default workspace found for account ' + accountId,
          HttpStatus.NOT_FOUND
        )
      }

      return defaultWorkspace
    } catch (err) {
      this.logger.error(
        `Failed to get workspace for user ${userId} and account ${accountId}`,
        err
      )
      throw err
    }
  }
}
