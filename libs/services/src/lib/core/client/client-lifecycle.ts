import { Client } from './client'

export interface ClientLifecycle {
  onClientClose(client: Client, reason: string, code: number): unknown
  onClientError(client: Client, error: any, message: string, type: string): unknown
  onClientIdentified(oldId: string, client: Client): void
}
