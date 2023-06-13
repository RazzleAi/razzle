import { ConfigService } from '@nestjs/config'
import {
  GenericContainer,
  StartedTestContainer,
  StartedMongoDBContainer,
  MongoDBContainer,
} from 'testcontainers'
import { PrismaService } from '../../app/prisma/prisma.service'
import { MigrationService } from '../../app/prisma/migration'

export class TestEnvironment {  
  mongoContainer: StartedMongoDBContainer
  configService: ConfigService

  async startTestContainers(): Promise<void> {    
    this.mongoContainer = await new MongoDBContainer()
      .withExposedPorts(27017)
      .start()

    this.configService = new ConfigService({
      DATABASE_URL: this.mongoContainer.getConnectionString(),      
    })
  }

  getMongoClient(): PrismaService {
    const migrationService = new MigrationService()
    return new PrismaService(this.configService, migrationService)
  }

  async shutdownTestContainers(): Promise<void> {
    await this.mongoContainer.stop()
  }
}
