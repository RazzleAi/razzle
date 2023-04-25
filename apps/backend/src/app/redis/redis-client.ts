import { Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import Redis from 'ioredis'

@Injectable()
export class RedisClient extends Redis {
  constructor(private readonly configService: ConfigService) {
    const config = configService.get('redis')
    super({ ...config })
  }
}
