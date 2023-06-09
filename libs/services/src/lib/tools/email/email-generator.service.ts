import { Email } from "./types"

export interface EmailGenerator {
  generateEmail(map: Map<string, unknown>): Promise<Email>

  type(): string
}
