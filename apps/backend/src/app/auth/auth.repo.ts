import {
  AuthRepo,
  CreateAuthUserReq,
  AuthPrincipal,
  UserAuthRecord,
} from '@razzle/domain'
import { Injectable } from '@nestjs/common'
import { Auth } from 'firebase-admin/auth'
import { auth } from 'firebase-admin'

@Injectable()
export class AuthRepoImpl implements AuthRepo {
  firebaseAuth: Auth
  constructor() {
    this.firebaseAuth = auth()
  }

  getUserByEmail(email: string): Promise<UserAuthRecord> {
    return this.firebaseAuth.getUserByEmail(email)
  }

  async createUser(
    req: CreateAuthUserReq
  ): Promise<{ user: UserAuthRecord; authToken: string }> {
    const user = await this.firebaseAuth.createUser(req)
    const token = await this.firebaseAuth.createCustomToken(user.uid)
    return { user: user, authToken: token }
  }

  deleteUser(authId: string): Promise<void> {
    return this.firebaseAuth.deleteUser(authId)
  }

  verifyAuthToken(token: string): Promise<AuthPrincipal> {
    return this.firebaseAuth.verifyIdToken(token)
  }
}
