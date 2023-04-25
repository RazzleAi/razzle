import { SetMetadata } from '@nestjs/common'

export const REGISTRY_METADATA_KEY = Symbol('__razzle--registry__')

export const Discover = (...v: unknown[]) => SetMetadata(REGISTRY_METADATA_KEY, v)
