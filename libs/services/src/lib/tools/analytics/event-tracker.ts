export interface AnalyticsEventTracker {
  trackEvent(event: string, properties?: any): void
  identify(userId: string, email?: string): void
}
