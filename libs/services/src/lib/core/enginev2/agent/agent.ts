import { RazzleResponse } from '@razzle/sdk'

export interface NlpProxyAgentAcceptParams {
  accountId: string
  workspaceId: string
  userId: string
  clientId: string
  prompt: string
}

export interface Agent {
  name: string
  description: string
  accept(params: NlpProxyAgentAcceptParams): Promise<RazzleResponse>
}
