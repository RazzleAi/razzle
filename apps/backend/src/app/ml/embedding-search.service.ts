import { Injectable } from '@nestjs/common'
import { EmbeddingSearchService } from '@razzle/services'

@Injectable()
export class EmbeddingSearchServiceImpl extends EmbeddingSearchService {
  constructor() {
    super()
  }
}
