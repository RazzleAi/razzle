import axios, { AxiosInstance } from 'axios'
import { createContext, ReactNode, useContext } from 'react'
import { environment } from '../environments/environment'
import { getAuth } from 'firebase/auth'

const httpClient = axios.create()
httpClient.defaults.baseURL = environment.baseUrl // TODO: use env vars
// httpClient.defaults.timeout = 4000 // 4 second timeout

const HttpClientContext = createContext<AxiosInstance>(httpClient)

export function HttpClientProvider({ children }: { children: ReactNode }) {
  return (
    <HttpClientContext.Provider value={httpClient}>
      {children}
    </HttpClientContext.Provider>
  )
}

export function useHttpClient(): AxiosInstance {
  const context = useContext(HttpClientContext)

  context.interceptors.request.use(async (config) => {
    if (!config.headers) {
      config.headers = {}
    }

    const currentUser = await getAuth().currentUser

    if (!currentUser) {
      return config
    }

    const token = await getAuth().currentUser?.getIdToken()
    config.headers['Authorization'] = `Bearer ${token}`
    return config
  })
  return context
}
