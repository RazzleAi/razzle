import { Module } from '@nestjs/common'
import { EventBusImpl } from './event-bus-impl'

@Module({
  providers: [EventBusImpl],
  exports: [EventBusImpl],
})
export class EventModule {}
