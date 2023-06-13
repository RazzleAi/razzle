import { ClientRequest, ClientToServerMessage } from '@razzle/dto'
import { User } from '../../user'

export interface ClientRequestValidator {
  validateRequest(
    request: ClientToServerMessage<ClientRequest>
  ): Promise<User | null>
}
