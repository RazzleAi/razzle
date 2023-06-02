import { Injectable } from '@nestjs/common'
import { Onboarding } from '@prisma/client'
import { OnboardingRepo } from '@razzle/domain'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class OnboardingRepoImpl implements OnboardingRepo {
  private prisma: PrismaService['onboarding']

  constructor(private readonly prismaService: PrismaService) {
    this.prisma = this.prismaService.onboarding
  }

  async createOnboarding(
    accountId: string,
    userId: string
  ): Promise<Onboarding> {
    const res = await this.prisma.create({
      data: {
        accountId,
        userId,
        appCreated: false,
        appSynced: false,
        firstActionTriggered: false,
        promptTriggered: false,
      },
      select: {
        id: true,
        accountId: true,
        userId: true,
        appCreated: true,
        appSynced: true,
        firstActionTriggered: true,
        promptTriggered: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    return res
  }

  findByAccountId(accountId: string): Promise<Onboarding> {
    return this.prisma.findFirst({
      where: {
        accountId,
      },
    })
  }

  async updateOnboarding(
    id: string,
    data: Partial<
      Omit<
        Onboarding,
        'id' | 'userId' | 'accountId' | 'createdAt' | 'updatedAt'
      >
    >
  ): Promise<void> {
    await this.prisma.update({
      where: {
        id,
      },
      data,
    })
  }
}
