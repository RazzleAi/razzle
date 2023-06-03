import { User } from '@prisma/client'
import { UserRepo } from './user.repo'
import { Logger } from '@nestjs/common'
import { WorkspaceService } from '../workspace'
import { UserDto } from '@razzle/dto'
import { CreateUserData, UpsertUserData } from './types'

export class UserService {
  private readonly logger = new Logger(UserService.name)

  constructor(
    private userRepo: UserRepo,
    private readonly workspaceService: WorkspaceService
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findByEmail(email)
  }

  findByUsername(username: string): Promise<User | null> {
    return this.userRepo.findByUsername(username)
  }

  async searchInAccountByEmailOrUsername(
    accountId: string,
    query: string
  ): Promise<UserDto[]> {
    return this.userRepo.searchInAccountByEmailOrUsername(query)
  }

  async findById(id: string): Promise<User | null> {
    return this.userRepo.findById(id)
  }

  async createUser(
    user: CreateUserData
  ): Promise<{ userId: string; authUid: string }> {
    return this.userRepo.createUser(user)
  }

  async upsertUser(
    authUid: string,
    user: UpsertUserData
  ): Promise<{ userId: string; authUid: string }> {
    return this.userRepo.upsertUser(authUid, user)
  }

  getUserByAuthUid(authId: string): Promise<User | null> {
    return this.userRepo.findByAuthUid(authId)
  }
}
