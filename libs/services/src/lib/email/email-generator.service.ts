import { Email } from '@prisma/client'

export interface EmailGenerator {
  generateEmail(map: Map<string, unknown>): Promise<Email>

  type(): string
}
