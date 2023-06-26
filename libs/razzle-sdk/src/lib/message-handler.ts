import { RawData } from 'ws'
import {
  AppSyncResponsePayload,
  AuthenticationRequestHeader,
  AuthFunction,
  Handler,
  MessageType,
  ServerMessage,
  ServerRequest,
} from './types'
import { CallDetails } from './call-details'
import Constants from './util/constants'

import { ActionPlanWithDetails } from '../action-plan-with-details'
import Logger from './util/logger'
import { RazzleResponse, RazzleResponseWithActionArgs } from './response'
export class MessageHandler {
  actionHandlers: Handler[]
  logger: Logger

  constructor(
    private readonly appId: string,
    private readonly apiKey: string,
    handlers: Handler[],
    private authFunction?: AuthFunction
  ) {
    this.actionHandlers = handlers
    this.logger = Logger.getInstance()
  }

  public async handleMessage(
    message: RawData | string
  ): Promise<ServerRequest | void> {
    try {
      const msgStr = message.toString()
      const json = JSON.parse(msgStr) as ServerMessage
      console.log('MessageHandler.handleMessage: Received message. ' + msgStr)
      this.logger.log(
        'MessageHandler.handleMessage: Received message. ' + msgStr
      )

      const type = json.event as MessageType
      const data = json.data

      switch (type) {
        case 'CallFunction':
          return this.handleCallFunctionMessage(data)
          break
        case 'SyncAppResponse':
          return this.handleAppSyncResponse(
            data['payload'] as AppSyncResponsePayload
          )
          break
        case 'Authenticate':
          return this.handleAuthenticationMessage({
            clientId: data['headers']['clientId'],
            applicationId: data['headers']['applicationId'],
            userId: data['headers']['userId'],
            accountId: data['headers']['accountId'],
          })
        default:
          break
      }
    } catch (err) {
      this.logger.log('MessageHandler.parseMessage: Error occurred', err)
    }
  }

  private handleAppSyncResponse(data: AppSyncResponsePayload) {
    if (data.success === true) {
      this.logger.log('App Sync succcessful', { appId: this.appId })
    } else {
      throw new Error('App Sync failed')
    }
  }

  private async handleCallFunctionMessage(
    data: any
  ): Promise<ServerRequest | void> {
    const payload = data.payload as ActionPlanWithDetails
    const headers = data.headers

    const clientId = headers.clientId
    const actionResponse = await this.handleActionTrigger(payload, headers)

    if (!actionResponse) {
      return
    }

    const responseMessage: ServerRequest = {
      event: 'FuncResponse',
      data: {
        headers: {
          ...data['headers'],
        },
        payload: { ...actionResponse, clientId },
      },
    }
    return responseMessage
  }

  private async handleAuthenticationMessage(
    headers: AuthenticationRequestHeader
  ): Promise<ServerRequest> {
    const callDetails = { ...headers }

    // if (this.authFunction) {
    //   const url = this.authFunction(this.appId, callDetails)
    //   if (!Constants.RegEx['URL'].test(url)) {
    //     throw new Error(`Invalid URL returned by AuthFunction. ${url}`)
    //   }

    //   const response: ServerRequest = {
    //     event: 'AuthenticateResponse',
    //     data: {
    //       payload: {
    //         clientId: callDetails.clientId,
    //         appId: callDetails.applicationId,
    //         userId: callDetails.userId,
    //         url,
    //       },
    //     },
    //   }

    //   return response
    // }

    throw new Error('Unable to Handle Authentication, no Auth Function defined')
  }

  private async handleActionTrigger(
    data: ActionPlanWithDetails,
    headers: any
  ): Promise<RazzleResponse | void> {
    const { actionName, args } = data
    const handler = this.findHandlerByAction(actionName)
    if (!handler) {
      // TODO: how do we want to handle actions with no handlers
      this.logger.error(
        `MessageHandler.handleActionTrigger: No handler found for action ${actionName}`
      )
      return
    }

    // call the handler
    const instance = handler.appInstance
    const method = handler.methodToCall
    const params = handler.methodParams
    const receivedArgs = args

    const callArgs = []

    for (let i = 0; i < receivedArgs.length; i++) {
      // only pass in arguments that the function can take
      if (i > params.length - 1) {
        break
      }

      const param = params.find((p) => p.paramIndex === i)
      if (!param) {
        continue
      }

      let callArg
      if (
        receivedArgs[i].type === 'date' ||
        receivedArgs[i].type === 'datetime'
      ) {
        callArg = new Date(receivedArgs[i].value as string)
      } else {
        callArg = param.paramTypeCtor(receivedArgs[i].value)
      }
      callArgs.push(callArg)
    }

    const callDetails: CallDetails = {
      userId: headers.userId,
      workspaceId: headers.workspaceId,
      accountId: headers.accountId,
      context: headers.context,
      headers: headers || {},
      pagination: handler.paged
        ? {
            pageNumber: headers.pageNumber || 1,
            pageSize: headers.pageSize || 10,
          }
        : undefined,
    }

    // Push the call details onto the end of the call args
    callArgs.push(callDetails)

    let result: any
    try {
      if (instance[method]) {
        if (handler.isPromise) {
          result = await instance[method].call(instance, ...callArgs)
        } else {
          result = instance[method].call(instance, ...callArgs)
        }
      }
    } catch (err) {
      this.logger.error(
        `MessageHandler.handleActionTrigger: Error occurred calling handler for action ${actionName}`,
        err
      )
      return new RazzleResponse({
        agentError: err.message ? err.message : err,
      })
    }

    if (result && handler.paged) {
      let newFrameId = (result as RazzleResponse).pagination?.frameId
      if (!newFrameId) {
        newFrameId = headers.frameId
      }
      if (!newFrameId) {
        newFrameId = this.newFrameId()
      }
      ;(result as RazzleResponse).pagination = {
        frameId: newFrameId,
        pageNumber: (result as RazzleResponse).pagination?.pageNumber || 1,
        pageSize: (result as RazzleResponse).pagination?.pageSize || 10,
        totalCount: (result as RazzleResponse).pagination?.totalCount || 1,
      }

      result = new RazzleResponseWithActionArgs(result, {
        actionName: actionName,
        actionDescription: handler.description,
        actionArgs: args,
      })
    }

    return result
  }

  private newFrameId(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  private findHandlerByAction(action: string): Handler | null {
    const handler = this.actionHandlers.filter(
      (h) => h.name.toLowerCase() === action.toLowerCase()
    )
    if (handler.length === 0) {
      return null
    }
    return handler[0]
  }
}
