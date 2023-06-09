import { Injectable } from '@nestjs/common'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { event, EventBus, ListenerFn } from '@razzle/services'

@Injectable()
export class EventBusImpl implements EventBus {
  constructor(private readonly emitter: EventEmitter2) {}

  emit(
    event: string | symbol | event[],
    ...values: Record<string, unknown>[]
  ): boolean {
    return this.emitter.emit(event, ...values)
  }
  emitAsync(
    event: string | symbol | event[],
    ...values: Record<string, unknown>[]
  ): Promise<Record<string, unknown>[]> {
    return this.emitter.emitAsync(event, ...values)
  }

  on(event: string | symbol | event[], listener: ListenerFn): this {
    this.emitter.on(event, listener)
    return this
  }
}
