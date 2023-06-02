import { Injectable } from '@nestjs/common'
import { EmbeddingSearchService } from '@razzle/domain'

@Injectable()
export class EmbeddingSearchServiceImpl extends EmbeddingSearchService {
  constructor() {
    super()
  }
}
