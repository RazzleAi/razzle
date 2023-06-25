/* eslint-disable @typescript-eslint/no-explicit-any */
import { MetadataInspector } from '@loopback/metadata'
import {
  ActionDecoratorArgs,
  actionMetadataKey,
  ActionParamDecoratorArgs,
  paramMetadataKey,
} from './decorators/action.decorator'
import { MessageHandler } from './message-handler'
import { RazzleServer } from './server'
import {
  AuthFunction,
  Handler,
  HandlerMethodParams,
  ServerRequest,
  SyncAppPayload,
} from './types'
import Logger from './util/logger'

type AppModule =
  | (new () => any)
  | { module: new (...args: any[]) => any; deps: any[] }

/**
 * Properties required to initialize the Razzle SDK.
 */
export interface RazzleAppProps {
  /**
   * The application ID for the Razzle app. You can get this from the Razzle dashboard.
   */
  appId: string
  /**
   * The API key for the Razzle app. You can get this from the Razzle dashboard.
   */
  apiKey: string
  /**
   * The modules that contain the actions for the Razzle app.
   */
  modules: AppModule[]
  /**
   * Whether or not the app requires authentication. If true, the authenticate function must be provided.
   */
  requiresAuth?: boolean
  authenticate?: AuthFunction
}

/**
 * Razzle is the main class for the Razzle SDK. It manages communication with the Razzle servers and handles registration of actions.
 */
export class Razzle {
  private actionHandlers: Handler[] = []
  private server: RazzleServer
  private appId: string
  private apiKey: string
  private requiresAuth: boolean
  private logger: Logger

  /**
   * Initialize the Razzle SDK
   * @param {RazzleAppProps} props Properties for the Razzle App.
   * @returns
   */
  static app(props: RazzleAppProps) {
    return new Razzle(props)
  }

  private constructor(props: RazzleAppProps) {
    const { appId, apiKey, modules, requiresAuth, authenticate } = props
    this.appId = appId
    this.apiKey = apiKey
    this.requiresAuth = requiresAuth ?? false
    this.actionHandlers = this.initHandlers(modules)
    this.logger = Logger.getInstance()

    if (this.requiresAuth === true && !!authenticate === false) {
      throw new Error('Authentication Handler is required')
    }

    const messageHandler = new MessageHandler(
      appId,
      apiKey,
      this.actionHandlers,
      authenticate
    )

    this.server = new RazzleServer(
      appId,
      apiKey,
      messageHandler,
      this.onServerConnected.bind(this)
    )
  }

  private onServerConnected() {
    this.logger.debug(
      'Razzle.onServerConnected: Connected to server. Registering actions...'
    )
    this.registerActions()
  }

  private initHandlers(apps: AppModule[]): Handler[] {
    const actionHandlers: Handler[] = []
    if (apps.length === 0) {
      throw new Error('Razzle.initHandlers: No apps registered')
    }

    const actionNames = new Set()

    for (const appModule of apps) {
      let appInstance
      let app
      if ('module' in appModule) {
        const { module, deps } = appModule
        appInstance = new module(...deps)
        app = module
      } else {
        appInstance = new appModule()
        app = appModule
      }

      const methodMetadata =
        MetadataInspector.getAllMethodMetadata<ActionDecoratorArgs>(
          actionMetadataKey,
          app.prototype
        )

      for (const methodName of Object.keys(methodMetadata)) {
        const actionParams = methodMetadata[methodName] as ActionDecoratorArgs
        if (actionNames.has(actionParams.name)) {
          throw new Error(`Duplicate action name ${actionParams.name}`)
        }
        actionNames.add(actionParams.name)

        // Check to make the description is provided
        if (!actionParams.description) {
          throw new Error(
            `RazzleApp.initHandlers: Action "${actionParams.name}" is missing a description.`
          )
        }

        // Actions are promptable (non-stealth) by default. Default stealth to false
        actionParams.stealth = actionParams.stealth || false
        if (actionParams.stealth) {
          actionParams.examples = []
        }

        // we can get parameter metadata here
        const paramMetadata =
          MetadataInspector.getAllParameterMetadata<ActionParamDecoratorArgs>(
            paramMetadataKey,
            app.prototype,
            methodName
          ) || []

        const paramTypes = Reflect.getMetadata(
          'design:paramtypes',
          appInstance,
          methodName
        )

        const method = appInstance[methodName]
        const isPromise = method.toString().includes('return __awaiter(')

        if (
          paramMetadata.length === 0 &&
          paramTypes &&
          paramTypes.length === 1
        ) {
          paramMetadata.push(undefined)
        }

        const paramNames = new Set()
        const methodParams: HandlerMethodParams[] = []
        for (let i = 0; i < paramMetadata.length; i++) {
          // Skip the last idx, meant for callDetails
          if (
            i === paramMetadata.length - 1 &&
            paramMetadata[i] === undefined
          ) {
            continue
          }

          const pmData = paramMetadata[i]
          const paramName = pmData.name
          if (paramNames.has(paramName)) {
            throw new Error(
              `RazzleApp.initHandlers: Duplicate param name ${paramName} on method ${app.name}.${methodName}`
            )
          }
          paramNames.add(paramName)

          const paramIndex = i
          if (!paramTypes || !paramTypes.length) {
            continue
          }

          const paramTypeStr = paramTypes[i].name.toLowerCase()
          const paramTypeCtor = paramTypes[i]
          methodParams.push({
            paramIndex,
            paramTypeCtor,
            paramTypeStr,
            paramName,
          })
        }

        const handler: Handler = {
          appInstance: appInstance,
          methodToCall: methodName,
          methodParamLen: paramMetadata.length,
          isPromise,
          methodParams,
          ...actionParams,
          paged: actionParams.paged || false,
        }
        actionHandlers.push(handler)
      }
    }

    return actionHandlers
  }

  private async registerActions() {
    const payload = this.buildRegisterAppPayload(this.actionHandlers)
    const request: ServerRequest = {
      event: 'SyncApp',
      data: {
        payload: payload,
      },
    }
    await this.server.send(request)
  }

  public onUserAuthenticated(userId: string) {
    if (!userId.length) {
      return
    }

    this.server.send({
      event: 'UserAppAuthentication',
      data: {
        payload: {
          appId: this.appId,
          userId,
        },
      },
    })
  }

  private buildRegisterAppPayload(handlers: Handler[]): SyncAppPayload {
    const actions = handlers.map((handler) => {
      const parameters = handler.methodParams.map((p) => ({
        name: p.paramName,
        type: p.paramTypeStr,
      }))
      const action = {
        name: handler.name,
        examples: handler.examples,
        stealth: handler.stealth,
        description: handler.description,
        paged: handler.paged,
        parameters,
      }
      return action
    })

    return { sdkVersion: '0.0.1', actions, requiresAuth: this.requiresAuth }
  }
}
