import { Logger } from '@nestjs/common'
import { RedisClient } from './redis-client'

export class RedisHash {
  private logger = new Logger(RedisHash.name)

  constructor(
    private readonly redisClient: RedisClient,
    private readonly hashKey: string
  ) {}

  async setAll(entries: Record<string, string>): Promise<void> {
    return new Promise((resolve, reject) => {
      this.redisClient.hset(
        this.hashKey,
        entries,
        (err?: Error | null, result?: number) => {
          if (err) {
            reject(err)
            return
          }

          const numKeys = Object.keys(entries).length
          this.logger.log(`Added ${result}/${numKeys} keys to hash ${this.hashKey}`)
          resolve()
        }
      )
    })
  }

  async getAll(): Promise<Record<string, string>> {
    return new Promise((resolve, reject) => {
      this.redisClient.hgetall(this.hashKey, (err, result) => {
        if (err) {
          reject(err)
          return
        }

        resolve(result)
      })
    })
  }

  async get(key: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.redisClient.hget(this.hashKey, key, (err, result) => {
        if (err) {
          reject(err)
          return
        }

        resolve(result || null)
      })
    })
  }

  async delete(...keys: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      this.redisClient.hdel(this.hashKey, ...keys, (err, result) => {
        if (err) {
          reject(err)
          return
        }

        this.logger.log(`Removed ${result} keys from hash ${this.hashKey}`)
        resolve()
      })
    })
  }
}
