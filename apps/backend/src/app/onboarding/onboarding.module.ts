import { Module } from '@nestjs/common'
import { EventModule } from '../event/event.module'
import { PrismaModule } from '../prisma/prisma.module'
import { OnboardingRepoImpl } from './onboarding.repo-impl'
import { OnboardingServiceImpl } from './onboarding.service-impl'

@Module({
  imports: [PrismaModule, EventModule],
  providers: [OnboardingRepoImpl, OnboardingServiceImpl],
  exports: [OnboardingRepoImpl, OnboardingServiceImpl],
})
export class OnboardingModule {}
