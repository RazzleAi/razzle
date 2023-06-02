import { Injectable } from '@nestjs/common'
import { EmbeddingService } from '@razzle/domain'

@Injectable()
export class EmbeddingServiceImpl extends EmbeddingService {
  constructor() {
    super()
  }
}
