import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Post,
  Put,
} from '@nestjs/common'
import {
  ActionAndArgsDto,
  AppDto,
  AppSyncStatusDto,
  CreateAppDto,
  CreateAppResponseDto,
  UpdateAppDto,
} from '@razzle/dto'
import {
  DuplicateResourceException,
  InvalidHandleException,
  User,
} from '@razzle/services'
import { ExceptionResponse, UseExceptionResponseHandler } from '../decorators'
import { AppsServiceImpl } from './apps.service-impl'
import { Principal, PrincipalKey } from '../auth/decorators'

@UseExceptionResponseHandler()
@Controller('apps')
export class AppsController {
  constructor(private readonly appService: AppsServiceImpl) {}

  @ExceptionResponse(
    {
      statusCode: HttpStatus.CONFLICT,
      types: [DuplicateResourceException],
    },
    {
      statusCode: HttpStatus.BAD_REQUEST,
      types: [InvalidHandleException],
    }
  )
  @Post()
  async createApp(
    @Principal(PrincipalKey.User) user: User,
    @Body() body: CreateAppDto
  ): Promise<CreateAppResponseDto> {
    return await this.appService.createApp(body.accountId, user, body)
  }

  @Get('/public')
  async getPublicApps(): Promise<AppDto[]> {
    return await this.appService.getPublicApps()
  }

  @Get('/:appId/:actionName/args')
  async getArgs(
    @Param('appId') appId: string,
    @Param('actionName') actionName: string
  ): Promise<ActionAndArgsDto> {
    const app = await this.appService.findById(appId)

    if (!app) {
      throw new Error('App not found')
    }

    const actions = app.data?.actions?.map((a) => a ).filter((a) => a.name === actionName)
    if (actions.length === 0) {
      throw new Error('No matching action found')
    }

    const resp: ActionAndArgsDto = {
      actionName: actions[0].name,
      actionDescription: actions[0].description,
      args: actions[0].parameters.map((p) => ({
        name: p.name,
        type: p.type,
      })),
    }
    return resp
  }

  @Get('/:appId')
  async getAppById(@Param('appId') appId: string): Promise<AppDto> {
    return await this.appService.findById(appId)
  }

  @Get('/:id/status')
  async appSyncStatus(@Param('id') id: string): Promise<AppSyncStatusDto> {
    return await this.appService.getAppSyncStatus(id)
  }

  @Post('/:id/api-key')
  async generateNewAPIKey(@Param('id') id: string): Promise<string> {
    return await this.appService.createNewApiKey(id)
  }

  @Put('/:id')
  async updateApp(
    @Param('id') id: string,
    @Body() body: UpdateAppDto
  ): Promise<AppDto> {
    return await this.appService.updateAppById(id, body)
  }

  @Delete('/:id')
  async deleteApp(@Param('id') id: string): Promise<boolean> {
    return await this.appService.deleteApp(id)
  }
}
