import {
  MessagePublisher,
  MessageSubscriber,
  SubscriptionHandle,
} from '@razzle/services'
import { v4 as uuid } from 'uuid'

type MessageHandler = {
  handle: SubscriptionHandle
  callback: (message: string) => void
}

export abstract class BasePubSub
  implements MessagePublisher, MessageSubscriber
{
  protected readonly subscribers: Map<string, MessageHandler[]> = new Map()

  public abstract publishMessage(topic: string, message: string): Promise<void>

  subscribeToMessages(
    topic: string,
    callback: (message: string) => void
  ): SubscriptionHandle {
    const handle = uuid()
    const handler: MessageHandler = {
      handle,
      callback,
    }
    const existingSubscribers = this.subscribers.get(topic) || []
    this.subscribers.set(topic, [...existingSubscribers, handler])
    return handle
  }

  unsubscribeFromMessages(topic: string, handle: SubscriptionHandle): void {
    const existingSubscribers = this.subscribers.get(topic) || []
    this.subscribers.set(
      topic,
      existingSubscribers.filter((s) => s.handle !== handle)
    )
  }
}
