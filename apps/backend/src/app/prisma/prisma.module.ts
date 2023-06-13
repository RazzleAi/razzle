import { Module } from '@nestjs/common'
import { PrismaService } from './prisma.service'
import { MigrationService } from './migration'

@Module({
  providers: [PrismaService, MigrationService],
  exports: [PrismaService],
})
export class PrismaModule {}
