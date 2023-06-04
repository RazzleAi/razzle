import { Injectable } from '@nestjs/common'
import {
  App,
  AppsRepo,
  NewAppDetails,
  UpdateAppInput,
  appFromPrisma,
} from '@razzle/services'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class AppsRepoImpl implements AppsRepo {
  private prisma: PrismaService['app']

  constructor(private readonly prismaService: PrismaService) {
    this.prisma = prismaService.app
  }

  findById(id: string): Promise<App | null> {
    return appFromPrisma(
      this.prisma.findUnique({
        where: {
          id,
        },
      })
    )
  }

  async findByAppId(props: { appId: string }): Promise<App | null> {
    const { appId } = props

    return appFromPrisma(
      this.prismaService.app.findFirst({
        where: {
          appId,
        },
      })
    )
  }

  async findByHandle(props: { handle: string }): Promise<App | null> {
    const { handle } = props

    return appFromPrisma(
      this.prismaService.app.findFirst({
        where: {
          handle,
        },
      })
    )
  }

  async findNonDeletedByHandle(props: { handle: string }): Promise<App | null> {
    const { handle } = props

    return appFromPrisma(
      this.prismaService.app.findFirst({
        where: {
          handle,
          deleted: false,
        },
      })
    )
  }

  async findPublicApps(): Promise<App[]> {
    const res = await this.prismaService.app.findMany({
      where: {
        isPublic: true,
        deleted: false,
      },
    })

    const apps: App[] = []
    for (const r of res) {
      apps.push(await appFromPrisma(r))
    }

    return apps
  }

  async createApp(accountId: string, app: NewAppDetails): Promise<App> {
    return appFromPrisma(
      this.prismaService.app.create({
        data: {
          appId: app.appId,
          name: app.name,
          description: app.description,
          handle: app.handle,
          iconUrl: app.iconUrl,
          apiKey: app.apiKey,
          isDefault: app.isDefault,
          isPublic: app.isPublic,
          creator: {
            connect: {
              id: accountId,
            },
          },
        },
      })
    )
  }

  async findAllByCreatorId(creatorId: string): Promise<App[]> {
    const res = await this.prisma.findMany({
      where: {
        creator: {
          id: creatorId,
        },
        deleted: false,
      },
    })

    const apps: App[] = []
    for (const r of res) {
      apps.push(await appFromPrisma(r))
    }
    return apps
  }

  async setNewApiKey(props: { appId: string; apiKey: string }): Promise<App> {
    const { appId, apiKey } = props
    const res = await this.prismaService.app.updateMany({
      where: {
        appId: appId,
      },
      data: {
        apiKey,
      },
    })

    if (res.count > 0) {
      return appFromPrisma(res[0])
    }
  }

  async getApiKeyForApp(props: { appId: string }): Promise<string> {
    const { appId } = props
    const result = await this.prismaService.app.findFirst({
      where: {
        appId: appId,
      },
      select: {
        apiKey: true,
      },
    })
    return result.apiKey
  }

  async updateApp(id: string, data: UpdateAppInput): Promise<App> {
    return appFromPrisma(
      this.prisma.update({
        where: {
          id: id,
        },
        data: data,
      })
    )
  }

  async updateAppData(id: string, data: { [key: string]: any }): Promise<App> {
    return appFromPrisma(
      this.prisma.update({
        where: {
          id,
        },
        data: {
          data: data,
        },
      })
    )
  }

  deleteById(id: string): Promise<App | null> {
    return appFromPrisma(
      this.prisma.update({
        where: {
          id,
        },
        data: {
          deleted: true,
        },
      })
    )
  }

  // TODO: DELETE THIS AFTER CLEANUP APP HANDLES IS RUN IN PROD
  async getAllApps(): Promise<App[]> {
    const res = await this.prisma.findMany({})

    const apps: App[] = []
    for (const r of res) {
      apps.push(await appFromPrisma(r))
    }
    return apps
  }

  async forceDeleteById(id: string): Promise<App> {
    const res = await this.prismaService.app.delete({
      where: {
        id,
      },
    })
    return appFromPrisma(res)
  }

  async deleteWorkspaceAppsForAppByID(appId: string): Promise<void> {
    await this.prismaService.workspaceApp.deleteMany({
      where: {
        app: {
          id: appId,
        },
      },
    })
  }
}
