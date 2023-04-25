import { Injectable } from '@nestjs/common'
import { Workspace, WorkspaceUserRole } from '@prisma/client'
import { PageParams, Page } from '@razzle/dto'
import {
  App,
  WorkspaceRepo,
  WorkspaceWithUser,
  appFromPrisma,
} from '@razzle/services'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class WorkspaceRepoImpl implements WorkspaceRepo {
  private workspace: PrismaService['workspace']

  constructor(private readonly prismaService: PrismaService) {
    this.workspace = prismaService.workspace
  }

  findById(id: string): Promise<Workspace | null> {
    return this.workspace.findFirst({
      where: {
        id,
      },
    })
  }

  async getAppsInWorkspace(workspaceId: string): Promise<App[]> {
    const result = await this.prismaService.workspaceApp.findMany({
      where: {
        workspaceId,
        workspace: {
          deleted: false,
        },
      },
      select: {
        app: true,
      },
    })

    const apps: App[] = []
    for (const res of result) {
      if (res.app.deleted === true) {
        continue
      }

      const app = await appFromPrisma(res.app)
      apps.push(app)
    }
    return apps
  }

  async addAppToWorkspace(workspaceId: string, appId: string): Promise<void> {
    await this.prismaService.workspaceApp.create({
      data: {
        workspaceId,
        appId,
      },
    })
  }

  async removeAppFromWorkspace(
    workspaceId: string,
    appId: string
  ): Promise<void> {
    await this.prismaService.workspaceApp.delete({
      where: {
        workspaceId_appId: {
          workspaceId,
          appId,
        },
      },
    })
  }

  async isAppInWorkspace(workspaceId: string, appId: string): Promise<boolean> {
    const result = await this.prismaService.workspaceApp.findFirst({
      where: {
        workspaceId,
        appId,
      },
    })
    return !!result
  }

  findWorkspacesByAccountId(accountId: string): Promise<Workspace[]> {
    return this.workspace.findMany({
      where: {
        account: {
          id: accountId,
        },
        deleted: false,
      },
    })
  }

  async addUserToWorkspace(workspaceId: string, userId: string): Promise<void> {
    await this.prismaService.workspaceUser.create({
      data: {
        workspaceId,
        userId,
        role: WorkspaceUserRole.MEMBER,
      },
    })
  }

  async addUsersToWorkspace(workspaceId: string, userIds: string[]) {
    await this.prismaService.workspaceUser.createMany({
      data: [
        ...userIds.map((userId) => ({
          workspaceId,
          userId,
          role: WorkspaceUserRole.MEMBER,
        })),
      ],
    })
  }

  async getAllUsersInWorkspace(
    workspaceId: string
  ): Promise<WorkspaceWithUser[]> {
    const res = await this.prismaService.workspaceUser.findMany({
      where: {
        workspaceId,
      },
      include: {
        workspace: true,
        user: true,
      },
    })

    return res
  }

  async countUsersInWorkspace(workspaceId: string): Promise<number> {
    const res = await this.prismaService.workspaceUser.count({
      where: {
        workspaceId,
      },
    })

    return res
  }

  async getUsersInWorkspace(
    workspaceId: string,
    pageParams: PageParams
  ): Promise<Page<WorkspaceWithUser>> {
    const res = await this.prismaService.workspaceUser.findMany({
      where: {
        workspaceId,
        id: pageParams.cursor && {
          gt: pageParams.cursor,
        },
      },
      include: {
        user: true,
        workspace: true,
      },
      take: pageParams.limit + 1,
    })

    const users = res.slice(0, pageParams.limit)
    const lastUser = res[res.length - 1]
    const hasNextPage = res.length > pageParams.limit
    const nextPageCursor = hasNextPage ? lastUser.id : null

    return {
      items: users,
      nextOffsetId: nextPageCursor,
    }
  }

  async removeUserFromWorkspace(
    workspaceId: string,
    userId: string
  ): Promise<void> {
    await this.prismaService.workspaceUser.delete({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId,
        },
      },
    })
  }

  async createWorkspaceWithUser(
    workspace: Omit<Workspace, 'id' | 'deleted' | 'createdAt' | 'updatedAt'>,
    userId: string
  ): Promise<WorkspaceWithUser> {
    const res = await this.prismaService.workspaceUser.create({
      data: {
        workspace: {
          create: {
            ...workspace,
          },
        },
        user: {
          connect: {
            id: userId,
          },
        },
        role: WorkspaceUserRole.ADMIN,
      },
      include: {
        workspace: true,
        user: true,
      },
    })
    return res
  }

  async deleteWorkspaceById(workspaceId: string): Promise<void> {
    await this.workspace.update({
      where: {
        id: workspaceId,
      },
      data: {
        deleted: true,
      },
    })
  }

  async findWorkspacesByUserIdAndAccountId(
    userId: string,
    accountId: string
  ): Promise<Workspace[]> {
    const res = await this.prismaService.workspaceUser.findMany({
      where: {
        userId,
        workspace: {
          accountId,
          deleted: false,
        },
      },
      select: {
        workspace: true,
      },
    })
    return res.map((r) => r.workspace)
  }

  async updateWorkspace(
    id: string,
    data: Partial<Workspace>
  ): Promise<Workspace> {
    const res = await this.workspace.update({
      where: {
        id,
      },
      data,
    })
    return res
  }
}
