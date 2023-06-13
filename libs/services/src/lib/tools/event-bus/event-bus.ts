export type event = symbol | string
export type eventNS = string | event[]
export interface ListenerFn {
  (...values: unknown[]): void
}

export interface EventBus {
  emit(event: event | eventNS, ...values: unknown[]): boolean
  emitAsync(event: event | eventNS, ...values: unknown[]): Promise<any[]>
  on(event: event | eventNS, listener: ListenerFn): this
}
