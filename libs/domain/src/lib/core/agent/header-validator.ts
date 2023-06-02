export interface AgentHeaderValidator {
  validateHeaders(headers: Record<string, string | string[]>): Promise<boolean>
}
