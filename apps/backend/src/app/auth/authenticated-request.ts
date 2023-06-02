import { AuthPrincipal, User } from '@razzle/domain'
import { Request } from 'node-fetch'

export interface AuthenticatedRequest extends Request {
  decodedToken: AuthPrincipal
  user: User
}
