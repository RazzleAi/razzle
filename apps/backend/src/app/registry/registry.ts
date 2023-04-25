import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { DiscoveryService } from '@nestjs/core'
import iterate from 'iterare'
import { REGISTRY_METADATA_KEY } from './discover.decorator'

@Injectable()
export class Registry implements OnModuleInit {
  private readonly logger = new Logger(Registry.name)
  private providers: Record<
    string | symbol,
    { instance: unknown; param?: string }[]
  > = {}

  constructor(private readonly discoveryService: DiscoveryService) {}

  public getProviders<T extends unknown[]>(
    key?: string | symbol,
    param?: string
  ): T {
    if (!key) {
      return Object.values(this.providers)
        .flat()
        .map((p) => p.instance) as T
    }

    let entries = this.providers[key] || []
    if (param) {
      entries = entries.filter((p) => p.param === param)
    }
    return entries.map((p) => p.instance) as T
  }

  public getSingleProvider(
    key?: string | symbol,
    param?: string
  ): unknown | null {
    const providers = this.getProviders(key, param)
    if (providers.length === 0) {
      return null
    }

    return providers[0]
  }

  onModuleInit() {
    const providers = this.discoveryService.getProviders()
    const res = this.scanDiscoverableInstanceWrappers(providers)
    this.providers = res
  }

  scanDiscoverableInstanceWrappers(
    wrappers: {
      metatype: unknown | null
      instance: unknown
      name: string
    }[]
  ): Record<string | symbol, { instance: unknown; param?: string }[]> {
    try {
      return iterate(wrappers)
        .filter(({ metatype }) => metatype && this.getMetadata(metatype))
        .reduce((acc, { metatype, instance, name }) => {
          const [type, param] = this.getMetadata(metatype)
          this.emitDiscoveredEvent({ type, param, name })

          return {
            ...acc,
            [type]: (acc[type] || []).concat({ param, instance }),
          }
        }, {})
    } catch (err) {
      console.error(err)
    }
  }

  private getMetadata(metatype: unknown) {
    return Reflect.getMetadata(REGISTRY_METADATA_KEY, metatype)
  }

  private emitDiscoveredEvent({
    type,
    param,
    name,
  }: {
    type: string | symbol
    param: string
    name: string
  }): void {
    const event = { event: 'DISCOVERED', type: type.toString(), param, name }
    this.logger.log(event)
  }
}
