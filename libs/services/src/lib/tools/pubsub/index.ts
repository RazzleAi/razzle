export interface MessagePublisher {
  publishMessage(topic: string, message: string): Promise<void>
}

export type SubscriptionHandle = string
export interface MessageSubscriber {
  subscribeToMessages(
    topic: string,
    callback: (message: string) => void
  ): SubscriptionHandle | Promise<SubscriptionHandle>

  unsubscribeFromMessages(topic: string, handle: SubscriptionHandle): void
}
