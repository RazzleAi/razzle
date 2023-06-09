export interface UserAuthRecord {
  uid: string
  email?: string
  emailVerified: boolean
  displayName?: string
  photoURL?: string
  disabled: boolean
}

export interface CreateAuthUserReq {
  uid?: string
  disabled?: boolean
  displayName?: string | null
  email?: string
  emailVerified?: boolean
  password?: string
  photoURL?: string | null
}

export interface AuthPrincipal {
  aud: string
  auth_time: number
  email?: string
  email_verified?: boolean
  exp: number
  iat: number
  iss: string
  picture?: string
  sub: string
  uid: string
  // Other arbitrary claims
  [key: string]: unknown
}

export interface AuthRepo {
  createUser(
    req: CreateAuthUserReq
  ): Promise<{ user: UserAuthRecord; authToken: string }>
  verifyAuthToken(token: string): Promise<AuthPrincipal>
}
