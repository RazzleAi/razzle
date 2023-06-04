import { ClientResponse, ClientToEngineRequest } from '@razzle/dto'
import { MessagePublisher, MessageSubscriber } from '../../pubsub'
import { ConnectedClients } from '../client'

// export interface ClientToEngineMessenger {
//   sendRequestToEngine(message: ClientToEngineRequest): Promise<void>
//   sendResponseToClient(clientId: string, message: ClientResponse): Promise<void>
//   onRequestReceivedFromClient(
//     callback: (request: ClientToEngineRequest) => void
//   ): Promise<void>
//   onResponseReceivedFromEngine(
//     clientId: string,
//     callback: (response: ClientResponse) => Promise<void>
//   ): Promise<void>
// }

const ENGINE_TO_CLIENT_TOPIC = 'engine-to-client-responses'

export class ClientToEngineMessenger {
  private readonly responseListeners: Map<
    string,
    (response: ClientResponse) => Promise<void>
  > = new Map()
  private readonly requestListeners: ((
    request: ClientToEngineRequest
  ) => void)[] = []

  constructor(
    private readonly connectedClients: ConnectedClients,
    private readonly messagePublisher: MessagePublisher,
    private readonly messageSubscriber: MessageSubscriber
  ) {
    this.setupSubscriber()
  }

  async sendRequestToEngine(message: ClientToEngineRequest): Promise<void> {
    for (const listener of this.requestListeners) {
      listener(message)
    }
  }

  async sendResponseToClient(
    clientId: string,
    message: ClientResponse
  ): Promise<void> {
    // send to process-local socket, fallback to message publisher
    const client = this.connectedClients.getById(clientId)
    let sendResponseFailed = false
    if (client) {
      const responseListener = this.responseListeners.get(clientId)
      if (responseListener) {
        try {
          await responseListener(message)
        } catch (err) {
          console.error('Error sending response to client', err)
          sendResponseFailed = true
        }
      }
    }

    // send to publisher, let another subscriber pick it up
    if (!client || sendResponseFailed) {
      await this.messagePublisher.publishMessage(
        ENGINE_TO_CLIENT_TOPIC,
        JSON.stringify(message)
      )
    }
  }

  async onRequestReceivedFromClient(
    callback: (request: ClientToEngineRequest) => void
  ): Promise<void> {
    this.requestListeners.push(callback)
  }

  async onResponseReceivedFromEngine(
    clientId: string,
    callback: (response: ClientResponse) => Promise<void>
  ): Promise<void> {
    this.responseListeners.set(clientId, callback)
  }

  async setupSubscriber(): Promise<void> {
    await this.messageSubscriber.subscribeToMessages(
      ENGINE_TO_CLIENT_TOPIC,
      async (message) => {
        const response = JSON.parse(message) as ClientResponse
        await this.sendResponseToClient(
          response.clientId,
          response as ClientResponse
        )
      }
    )
  }
}
