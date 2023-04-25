// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from 'firebase/app'
import { getAuth, Auth, User } from 'firebase/auth'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useState,
} from 'react'
import { environment } from '../environments/environment'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = environment.firebaseConfig

export interface FirebaseServices {
  app: FirebaseApp
  auth: Auth
  currentUser?: User
  setCurrentUser: Dispatch<SetStateAction<User | undefined>>
}

// Initialize Firebase
export const firebaseApp = initializeApp(firebaseConfig)
export const firebaseAuth = getAuth(firebaseApp)

const firebaseServices = {
  app: firebaseApp,
  auth: firebaseAuth,
  setCurrentUser: () => null,
}
const FirebaseContext = createContext<FirebaseServices>(firebaseServices)

export function FirebaseContextProvider({ children }: { children: ReactNode }) {
  const [currUser, setCurrentUser] = useState<User | undefined>()
  return (
    <FirebaseContext.Provider
      value={{
        app: firebaseApp,
        auth: firebaseAuth,
        currentUser: currUser,
        setCurrentUser: setCurrentUser,
      }}
    >
      {children}
    </FirebaseContext.Provider>
  )
}

export function useFirebaseServices(): FirebaseServices {
  const { app, auth, currentUser, setCurrentUser } = useContext(FirebaseContext)
  return { app, auth, currentUser, setCurrentUser }
}
