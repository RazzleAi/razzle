import { User } from '@prisma/client'
import { ClientRequest, ClientToServerMessage } from '@razzle/dto'

export interface ClientRequestValidator {
  validateRequest(
    request: ClientToServerMessage<ClientRequest>
  ): Promise<User | null>
}
