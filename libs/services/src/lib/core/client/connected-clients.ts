import { Client } from './client'

export class ConnectedClients {
  private connectedClients = new Map<string, Client>()
  private identifiedClients = new Map<string, Client>()
  private identifiedByUser = new Map<string, Client>()

  add(client: Client) {
    this.connectedClients.set(client.id, client)
  }

  remove(client: Client) {
    this.connectedClients.delete(client.id)
    this.identifiedClients.delete(client.id)
    if (client.userId) {
      this.identifiedByUser.delete(client.userId)
    }
  }

  identify(oldId: string, client: Client) {
    this.connectedClients.delete(oldId)
    this.identifiedClients.set(client.id, client)
    if (client.userId) {
      this.identifiedByUser.set(client.userId, client)
    }
  }

  getById(id: string): Client | undefined {
    return this.identifiedClients.get(id)
  }

  getByUserId(userId: string): Client | undefined {
    return this.identifiedByUser.get(userId)
  }
}
