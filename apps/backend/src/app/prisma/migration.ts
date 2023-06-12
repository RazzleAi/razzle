import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { AccountApp } from '@prisma/client'

@Injectable()
export class MigrationService {
  migrate(prismaService: PrismaService) {
    this.migrateAccountApps(prismaService)
  }

  async migrateAccountApps(prismaService: PrismaService) {
    // update account apps
    // copy apps from workspace apps and add to account apps
    const accountCollection: PrismaService['account'] = prismaService.account
    const workspaceCollection: PrismaService['workspace'] =
      prismaService.workspace
    const workspaceAppsCollection: PrismaService['workspaceApp'] =
      prismaService.workspaceApp

    const workspaces = await workspaceCollection.findMany()
    for (const workspace of workspaces) {
      const account = await accountCollection.findUnique({
        where: {
          id: workspace.accountId,
        },
      })

      const workspaceApps = await workspaceAppsCollection.findMany({
        where: {
          workspaceId: workspace.id,
        },
      })

      const accountApps: AccountApp[] = []
      for (const workspaceApp of workspaceApps) {
        accountApps.push({
          appId: workspaceApp.appId,
          dateAdded: workspaceApp.createdAt,
        })
      }

      await accountCollection.update({
        where: {
            id: account.id,
        },
        data: {
            accountApps: accountApps,
        },
      })
    }

    
  }
}
