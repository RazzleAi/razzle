import { Injectable } from '@nestjs/common'
import { WorkspaceService } from '@razzle/services'
import { AppsServiceImpl } from '../apps/apps.service-impl'
import { DefaultAppsServiceImpl } from '../default-apps/default-apps.service-impl'
import { EventBusImpl } from '../event/event-bus-impl'
import { PromptResolverServiceImpl } from '../ml/args-extractor.service.impl'
import { EmbeddingSearchServiceImpl } from '../ml/embedding-search.service'
import { WorkspaceRepoImpl } from './workspace.repo-impl'

@Injectable()
export class WorkspaceServiceImpl extends WorkspaceService {
  constructor(
    workspaceRepository: WorkspaceRepoImpl,
    embeddingSearchService: EmbeddingSearchServiceImpl,
    argsExtractorService: PromptResolverServiceImpl,
    appsService: AppsServiceImpl,
    defaultAppsService: DefaultAppsServiceImpl,
    eventBus: EventBusImpl
  ) {
    super(
      workspaceRepository,
      embeddingSearchService,
      argsExtractorService,
      appsService,
      defaultAppsService,
      eventBus
    )
  }
}
