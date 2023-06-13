import { UserService } from '@razzle/services'
import { Injectable } from '@nestjs/common'
import { UserRepoImpl } from './user.repo.impl'

@Injectable()
export class UserServiceImpl extends UserService {
  constructor(
    userRepository: UserRepoImpl,
  ) {
    super(userRepository)
  }
}
