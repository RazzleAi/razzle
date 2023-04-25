import { ClientResponse, ClientToEngineRequest } from '@razzle/dto'

export interface ClientToEngineMessenger {
  sendRequestToEngine(message: ClientToEngineRequest): Promise<void>
  sendResponseToClient(clientId: string, message: ClientResponse): Promise<void>
  onRequestReceivedFromClient(callback: (request: ClientToEngineRequest) => void): Promise<void>
  onResponseReceivedFromEngine(clientId: string, callback: (response: ClientResponse) => Promise<void>): Promise<void>
}
