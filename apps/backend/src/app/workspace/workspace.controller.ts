import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common'
import {
  AddWorkspaceUsersDto,
  CreateWorkspaceDto,
  CreateWorkspaceResponseDto,
  Page,
  WorkspaceActionDto,
  WorkspaceSearchResponseDto,
} from '@razzle/dto'
import {
  DuplicateWorkspaceNameException,
  WorkspaceWithUser,
} from '@razzle/domain'
import { Principal, PrincipalKey } from '../auth/decorators'
import { ExceptionResponse, UseExceptionResponseHandler } from '../decorators'
import { WorkspaceServiceImpl } from './workspace.service-impl'

@UseExceptionResponseHandler()
@Controller('workspace')
export class WorkspaceController {
  constructor(private readonly workspaceService: WorkspaceServiceImpl) {}

  @Post()
  @HttpCode(201)
  @ExceptionResponse({
    types: [DuplicateWorkspaceNameException],
    statusCode: HttpStatus.CONFLICT,
  })
  async createWorkspace(
    @Principal(PrincipalKey.UserId) userId: string,
    @Body() body: CreateWorkspaceDto
  ): Promise<CreateWorkspaceResponseDto> {
    const res = await this.workspaceService.createWorkspaceWithUser(
      body,
      userId
    )
    return {
      id: res.id,
      name: res.workspace.name,
      description: res.workspace.description,
    }
  }

  @Get(':id/search')
  async search(
    @Query('q') query: string,
    @Param('id') id: string
  ): Promise<WorkspaceSearchResponseDto[]> {
    const searchResults = await this.workspaceService.searchInWorkspace(
      id,
      query
    )
    const result = searchResults.map((result) => ({
      sentence: result.sentence,
      actionName: result.actionName,
      actionDescription: result.actionDescription,
      appId: result.appId,
      appName: result.appName,
    }))

    // Take unique results by actionName and appId
    return result.filter(
      (result, index, self) =>
        index ===
        self.findIndex(
          (t) => t.actionName === result.actionName && t.appId === result.appId
        )
    )
  }

  @HttpCode(201)
  @Post(':id/app/:appId')
  addAppToWorkspace(@Param('id') id: string, @Param('appId') appId: string) {
    return this.workspaceService.addAppToWorkspace(appId, id)
  }

  @Get(':id/all-members')
  async getAllWorkspaceMembers(
    @Param('id') id: string
  ): Promise<WorkspaceWithUser[]> {
    return this.workspaceService.getAllUsersInWorkspace(id)
  }

  @Get(':id/members')
  async getWorkspaceMembers(
    @Param('id') id: string,
    @Query('count') count?: number,
    @Query('cursor') cursor?: string
  ): Promise<Page<WorkspaceWithUser>> {
    return this.workspaceService.getUsersInWorkspace(id, {
      cursor: cursor,
      limit: count || 10,
    })
  }

  @Post(':id/members')
  async addWorkspaceMembers(
    @Param('id') id: string,
    @Body() body: AddWorkspaceUsersDto
  ): Promise<void> {
    return this.workspaceService.addUsersToWorkspace(id, body.userIds)
  }

  @Get(':id/member-count')
  async getWorkspaceMemberCount(@Param('id') id: string): Promise<number> {
    return this.workspaceService.countUsersInWorkspace(id)
  }

  @Get(':id/actions')
  async getActionsForWorkspace(
    @Param('id') id: string
  ): Promise<WorkspaceActionDto[]> {
    return this.workspaceService.getActionsInWorkspace(id)
  }

  @Get(':id/actions/searches')
  async searchActionsForWorkspace(
    @Param('id') workspaceId: string,
    @Query('query') query: string
  ): Promise<WorkspaceActionDto[]> {
    return this.workspaceService.searchActionsInWorkspace(workspaceId, query)
  }
}
