import { Injectable } from '@nestjs/common'
import { EmbeddingService } from '@razzle/services'

@Injectable()
export class EmbeddingServiceImpl extends EmbeddingService {
  constructor() {
    super()
  }
}
