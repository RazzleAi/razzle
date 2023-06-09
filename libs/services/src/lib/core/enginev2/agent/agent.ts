import { RazzleResponse } from '@razzle/sdk'

export interface NlpProxyAgentAcceptParams {
  accountId: string
  userId: string
  clientId: string
  prompt: string
}

export interface IAgent {
  id: string
  name: string
  description: string
  accept(params: NlpProxyAgentAcceptParams): Promise<RazzleResponse>
}
