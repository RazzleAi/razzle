import { AgentMessage, ServerToAgentMessage } from '@razzle/dto'
import { RazzleResponse } from '@razzledotai/sdk'
import { AgentToEngineMessenger } from '../messaging'
import { v4 as uuid } from 'uuid'

export class AgentCaller {
  private responseMap: Map<string, RazzleResponse> = new Map<
    string,
    RazzleResponse
  >()

  constructor(private readonly agentMessenger: AgentToEngineMessenger) {
    this.agentMessenger.onResponseReceivedFromAgent(
      this.handleFuncResponseFromAgent.bind(this)
    )
  }

  async callAction(callDetails: {
    action: any
    userId: string
    accountId: string
    headers?: Record<string, unknown>
  }): Promise<RazzleResponse> {
    const { appId, actionName } = callDetails.action

    if (!appId) {
      throw new Error(`AppId not specified for actionPlan ${actionName}`)
    }

    const headers = {
      ...callDetails.headers,
      applicationId: appId,
      userId: callDetails.userId,
      accountId: callDetails.accountId,
      responseType: 'MRKLStepSequence',
      responseKey: `${actionName}-${uuid()}`,
    }

    const message: AgentMessage = {
      appId,
      headers,
      payload: callDetails.action,
    }
    const messageEnvelope: ServerToAgentMessage<AgentMessage> = {
      event: 'CallFunction',
      data: message,
    }

    const messageJson = JSON.stringify(messageEnvelope)
    console.log(`AgentCaller: Message JSON: ${messageJson}`)

    // send message to agent by app id
    this.agentMessenger.sendMessageToAgent(appId, messageEnvelope)

    return new Promise((resolve, reject) => {
      let waitTime = 0
      const interval = setInterval(() => {
        console.log('AgentCaller: Waiting for response with key: ', {key: headers['responseKey'], appId})
        const response = this.responseMap.get(headers['responseKey'])
        if (response) {
          console.log('AgentCaller: Got response from key: ', headers['responseKey'])
          clearInterval(interval)
          resolve(response)
          return
        } else if (waitTime > 50000) {
          // TODO: move this to a configuration
          clearInterval(interval)
          console.error('AgentCaller: Timeout while waiting for response with key: ', headers['responseKey'])
          reject('Timeout while waiting for response ' + headers['responseKey'])
          return
        }

        waitTime += 100
      }, 100)
    })
  }

  private async handleFuncResponseFromAgent(response: AgentMessage) {
    const { headers, payload, appId } = response
    if (!headers || !payload) {
      console.warn(
        'StepSequenceAgentFuncResponseHandler.canHandleResponse: Missing headers or payload in message'
      )
      return
    }

    if (
      headers['responseType'] !== 'MRKLStepSequence' ||
      typeof headers['responseKey'] !== 'string'
    ) {
      console.warn(
        'StepSequenceAgentFuncResponseHandler.canHandleResponse: Unknown response type',
        headers
      )
      return
    }

    // handle response
    const { clientId, ui, data, error } = payload
    console.debug(
      'RazzleEngine.handleFuncResponseFromAgent handling FuncResponse: ',
      clientId,
      appId,
      ui,
      data
    )

    const responseKey = headers['responseKey'] as string
    this.responseMap.set(responseKey, payload)
    setTimeout(
      () => {
        this.responseMap.delete(responseKey)
      },
      4000 // make this a configuration
    )
  }
}
