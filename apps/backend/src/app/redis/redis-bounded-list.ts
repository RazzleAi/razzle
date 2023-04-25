import { RedisClient } from './redis-client'

export class RedisBoundedList {
  constructor(
    private readonly redisClient: RedisClient,
    private readonly key: string,
    private readonly maxLen?: number
  ) {}

  async getSize(): Promise<number> {
    return new Promise((resolve, reject) => {
      this.redisClient.llen(this.key, (err, result) => {
        if (err) {
          reject(err)
          return
        }

        resolve(result)
      })
    })
  }

  async push(item: string): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.redisClient.lpush(this.key, item, (err, result) => {
        if (err) {
          reject(err)
          return
        }

        resolve()
      })
    })

    if (this.maxLen) {
      await this.trim()
    }
  }

  async pushMany(items: string[]): Promise<void> {
    await new Promise<void>((resolve, reject) => {
      this.redisClient.lpush(this.key, ...items, (err, result) => {
        if (err) {
          reject(err)
          return
        }

        resolve()
      })
    })

    if (this.maxLen) {
      await this.trim()
    }
  }

  private async trim(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.redisClient.ltrim(this.key, 0, this.maxLen - 1, (err, result) => {
        if (err) {
          reject(err)
          return
        }

        resolve()
      })
    })
  }

  async pop(): Promise<string | null> {
    return new Promise((resolve, reject) => {
      this.redisClient.lpop(this.key, (err, result) => {
        if (err) {
          reject(err)
          return
        }

        resolve(result)
      })
    })
  }

  async getItems(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      this.redisClient.lrange(this.key, 0, -1, (err, result) => {
        if (err) {
          reject(err)
          return
        }

        resolve(result)
      })
    })
  }

  async clear(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.redisClient.del(this.key, (err, result) => {
        if (err) {
          reject(err)
          return
        }

        resolve()
      })
    })
  }
}
