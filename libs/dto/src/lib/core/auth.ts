import { Message } from "./message"

export interface AuthenticationMessage extends Message {
  appId: string
  userId: string
  url: string
}
