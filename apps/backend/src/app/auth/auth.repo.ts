import {
  AuthRepo,
  CreateAuthUserReq,
  AuthPrincipal,
  UserAuthRecord,
} from '@razzle/services'
import { Injectable } from '@nestjs/common'
import { Auth } from 'firebase-admin/auth'
import { auth } from 'firebase-admin'

@Injectable()
export class AuthRepoImpl implements AuthRepo {
  firebaseAuth: Auth
  constructor() {
    this.firebaseAuth = auth()
  }

  async createUser(
    req: CreateAuthUserReq
  ): Promise<{ user: UserAuthRecord; authToken: string }> {
    const user = await this.firebaseAuth.createUser(req)
    const token = await this.firebaseAuth.createCustomToken(user.uid)
    return { user: user, authToken: token }
  }

  verifyAuthToken(token: string): Promise<AuthPrincipal> {
    return this.firebaseAuth.verifyIdToken(token)
  }
}
