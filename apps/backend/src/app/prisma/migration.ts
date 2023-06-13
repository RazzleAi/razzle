import { Injectable } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { Account, AccountApp, WorkspaceApp } from '@prisma/client'

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

    const accounts = await accountCollection.findMany()
    const accountsNeedingMigration: {
      account: Account
      workspaceApps: WorkspaceApp[]
    }[] = []
    for (const account of accounts) {
      if (account.accountApps.length === 0) {
        const workspacesInAccount = await workspaceCollection.findMany({
          where: {
            accountId: account.id,
          },
          include: {
            workspaceApps: true,
          },
        })
        const workspaceApps: WorkspaceApp[] = []
        for (const workspace of workspacesInAccount) {
          workspaceApps.push(...workspace.workspaceApps)
        }

        if (workspaceApps.length > 0) {
          accountsNeedingMigration.push({
            account,
            workspaceApps,
          })
        }
      }
    }

    for (const accountNeedingMigration of accountsNeedingMigration) {
      const { account, workspaceApps } = accountNeedingMigration
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
