/* eslint-disable @typescript-eslint/ban-types */
import 'reflect-metadata'
import {
  MethodDecoratorFactory,
  ParameterDecoratorFactory,
} from '@loopback/metadata'

export interface Example {
  title: string
  args: string[]
}

/**
 * Arguments for the Action decorator.
 */
export interface ActionDecoratorArgs {
  /**
   * @deprecated use the `description` property instead.
   */
  examples?: Example[]
  roles?: string[]
  /**
   * The name of the action. This is what the user will type to call the action.
   */
  name: string
  /**
   * A description of the action. The Razzle AI uses this description to help the user understand what the action does.
   */
  description: string
  /**
   * Whether or not the action should be hidden from the user. If true, the action will not be listed in the Razzle UI and can only be called from links.
   */
  stealth?: boolean
  /**
   * Whether or not the action supports pagination. If true, the action will be able to return multiple pages of data.
   * The user will be able to navigate between pages using the Razzle UI.
   */
  paged?: boolean
}

export const actionMetadataKey = '__actionMetatdataKey__'

/**
 * Decorator to mark a method as an action.
 * example:
 * ```ts
 * @Action({
 *  name: 'myAction',
 *  description: 'This is my action',
 * })
 * myAction() {
 *  return new RazzleResponse({ui: new RazzleText({text: 'Hello World!'})})
 * }
 * ```
 * @param args
 * @returns
 */
export function Action(args: ActionDecoratorArgs) {
  return MethodDecoratorFactory.createDecorator<ActionDecoratorArgs>(
    actionMetadataKey,
    args
  )
}

/**
 * Arguments for the ActionParam decorator.
 */
export interface ActionParamDecoratorArgs {
  name: string
}

export const paramMetadataKey = '__paramMetadataKey__'
/**
 * The ActionParam decorator is used to mark a parameter as an action parameter.
 * example:
 * ```ts
 * @Action({
 *   name: 'findUserByEmail',
 *   description: 'Finds a user by email',
 * })
 * findUserByEmail(@ActionParam({name: 'email'}) email: string) {
 *    ...
 *    return new RazzleResponse({ui: new RazzleText({text: user.name})})
 * }
 * ```
 * @param name The name of the parameter.
 * @returns 
 */
export function ActionParam(name: string) {
  return ParameterDecoratorFactory.createDecorator<ActionParamDecoratorArgs>(
    paramMetadataKey,
    { name }
  )
}
