import { ConfigService } from '@nestjs/config'
import {
  GenericContainer,
  StartedTestContainer,
  StartedMongoDBContainer,
  MongoDBContainer,
} from 'testcontainers'
import { PrismaService } from '../../app/prisma/prisma.service'
import { RedisClient } from '../../app/redis/redis-client'

export class TestEnvironment {
  redisContainer: StartedTestContainer
  mongoContainer: StartedMongoDBContainer
  configService: ConfigService

  async startTestContainers(): Promise<void> {
    this.redisContainer = await new GenericContainer('redis')
      .withExposedPorts(6379)
      .start()

    this.mongoContainer = await new MongoDBContainer()
      .withExposedPorts(27017)
      .start()

    this.configService = new ConfigService({
      DATABASE_URL: this.mongoContainer.getConnectionString(),
      redis: {
        port: this.redisContainer.getMappedPort(6379),
        host: this.redisContainer.getHost(),
        // password: process.env.REDIS_PASSWORD,
      },
    })
  }

  getRedisClient(): RedisClient {
    return new RedisClient(this.configService)
  }

  getMongoClient(): PrismaService {
    return new PrismaService(this.configService)
  }

  async shutdownTestContainers(): Promise<void> {
    await this.redisContainer.stop()
    await this.mongoContainer.stop()
  }
}
