import { StrictMode } from 'react'
import * as ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import App from './app/app'
import { FirebaseContextProvider } from './app/firebase'
import { HttpClientProvider } from './app/http-client'
import { MixpanelContextProvider } from './app/mixpanel'

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <FirebaseContextProvider>
      <HttpClientProvider>
        <MixpanelContextProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </MixpanelContextProvider>
      </HttpClientProvider>
    </FirebaseContextProvider>
  </StrictMode>
)
