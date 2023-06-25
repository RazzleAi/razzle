import { Module } from '@nestjs/common'
import { PrismaModule } from '../prisma/prisma.module'
import { OnboardingRepoImpl } from './onboarding.repo-impl'
import { OnboardingServiceImpl } from './onboarding.service-impl'
import { ToolsModule } from '../tools/tools.module'

@Module({
  imports: [PrismaModule, ToolsModule],
  providers: [OnboardingRepoImpl, OnboardingServiceImpl],
  exports: [OnboardingRepoImpl, OnboardingServiceImpl],
})
export class OnboardingModule {}
