import { Module } from '@nestjs/common'
import { PromptResolverServiceImpl } from './args-extractor.service.impl'
import { EmbeddingSearchServiceImpl } from './embedding-search.service'
import { EmbeddingServiceImpl } from './emedding.service.impl'

@Module({
  providers: [
    EmbeddingServiceImpl,
    EmbeddingSearchServiceImpl,
    PromptResolverServiceImpl,
  ],
  exports: [
    EmbeddingServiceImpl,
    EmbeddingSearchServiceImpl,
    PromptResolverServiceImpl,
  ],
})
export class MlModule {}
