import { UserService } from '@razzle/services'
import { Injectable } from '@nestjs/common'
import { UserRepoImpl } from './user.repo.impl'
import { WorkspaceServiceImpl } from '../workspace/workspace.service-impl'

@Injectable()
export class UserServiceImpl extends UserService {
  constructor(
    userRepository: UserRepoImpl,
    workspaceServiceImpl: WorkspaceServiceImpl
  ) {
    super(userRepository, workspaceServiceImpl)
  }
}
