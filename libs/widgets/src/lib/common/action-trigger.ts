/**
 * Action trigger interface
 */
export interface IActionTrigger {
  /**
   * The action to trigger or the url to open
   */
  action: string
  /**
   * The label of the action
   */
  label?: string
  /**
   * The arguments to pass to the action
   */
  args?: any[]
  /**
   * The type of the action
   */
  type?: 'RazzleAction' | 'URL'
}
