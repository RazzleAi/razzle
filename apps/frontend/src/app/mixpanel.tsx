import mixpanel from 'mixpanel-browser'
import { createContext, ReactNode, useContext } from 'react'
import { environment } from '../environments/environment'

export interface MixpanelServices {
  trackEvent: (eventName: string, properties?: any) => void
  identify: (userId: string, email?: string) => void
}

mixpanel.init(environment.mixpanelKey, { debug: false })
const mixpanelServices: MixpanelServices = {
  trackEvent: (eventName: string, properties?: any) => {
    const url = new URL(window.location.href)
    let path = url.pathname
    // remove leading slash
    path = path[0] === '/' ? path.substring(1) : path
    const parts = path.split('/')
    const accountId = parts[0]

    console.debug('trackEvent', eventName, { ...properties, accountId })
    mixpanel.track(eventName, { ...properties, accountId })
  },
  identify: (userId: string, email?: string) => {
    mixpanel.identify(userId)
    if (email) {
      mixpanel.people.set({
        email: email,
      })
    }
  },
}

const MixpanelContext = createContext<MixpanelServices>(mixpanelServices)

export function MixpanelContextProvider({ children }: { children: ReactNode }) {
  return (
    <MixpanelContext.Provider value={mixpanelServices}>
      {children}
    </MixpanelContext.Provider>
  )
}

export function useEventTracker(): MixpanelServices {
  return useContext(MixpanelContext)
}
