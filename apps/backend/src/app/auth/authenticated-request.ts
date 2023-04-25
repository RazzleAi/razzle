import { AuthPrincipal, User } from '@razzle/services'
import { Request } from 'node-fetch'

export interface AuthenticatedRequest extends Request {
  decodedToken: AuthPrincipal
  user: User
}
