import { CreateUserData, UpsertUserData, User } from './types'

export interface UserRepo {
  createUser: (
    user: CreateUserData
  ) => Promise<{ userId: string; authUid: string }>
  findById: (id: string) => Promise<User | null>
  findByEmail: (email: string) => Promise<User | null>
  findByUsername: (username: string) => Promise<User | null>
  searchInAccountByEmailOrUsername: (query: string) => Promise<User[]>
  findByAuthUid: (authUid: string) => Promise<User | null>
  upsertUser: (
    authUid: string,
    user: UpsertUserData
  ) => Promise<{ userId: string; authUid: string }>
  // TODO: MAKE THIS PRIVATE AFTER USERNAME CLEANUP IN PROD
  getAllUsers: () => Promise<User[]>
}
