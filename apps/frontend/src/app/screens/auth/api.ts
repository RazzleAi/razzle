import { useFirebaseServices } from '../../firebase'
import { useMutation } from 'react-query'
import {
  Auth,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
} from '@firebase/auth'
import { FirebaseError } from '@firebase/util'
import { UserCredential } from 'firebase/auth'
import { useHttpClient } from '../../http-client'
import { AxiosInstance } from 'axios'
import {
  ThirdPartyAuthAccountInviteDto,
  ThirdPartyAuthDto,
  ThirdPartyAuthResponseDto,
} from '@razzle/dto'
import Log from '../../utils/logger'
import { useEventTracker } from '../../mixpanel'
import { LOGIN_SUCCESS } from '../../events'

export type SigninType = 'google' | 'github'

export function useDoThirdPartySignin(config?: {
  onSuccess?: (val: any) => void
  onError?: (err: any, variables: SigninType, context: any) => void
}) {
  const { auth } = useFirebaseServices()
  const httpClient = useHttpClient()
  const { trackEvent } = useEventTracker()

  return useMutation(
    (type: SigninType) => {
      let provider: any
      switch (type) {
        case 'google': {
          provider = new GoogleAuthProvider()
          provider.setCustomParameters({ prompt: 'select_account' })
          break
        }

        case 'github':
          provider = new GithubAuthProvider()
          provider.addScope('repo')
          provider.setCustomParameters({
            allow_signup: 'false',
          })
          break
        default:
          throw new Error('Invalid signin type')
      }

      return signInWithPopup(auth, provider)
        .then(async (cred) => {
          const res = await updateThirdPartyUser(httpClient, cred)
          trackEvent(LOGIN_SUCCESS, {
            ...res,
          })
          return res
        })
        .catch((err) => {
          handleError(err)
        })
    },
    { onSuccess: config?.onSuccess, onError: config?.onError }
  )
}

export function useDoThirdPartySigninFromAccountInvite(
  token: string,
  config?: {
    onSuccess?: (val: any) => void
    onError?: (err: any, variables: SigninType, context: any) => void
  }
) {
  const { auth } = useFirebaseServices()
  const httpClient = useHttpClient()
  const { trackEvent } = useEventTracker()

  return useMutation(
    (type: SigninType) => {
      let provider: any
      switch (type) {
        case 'google': {
          provider = new GoogleAuthProvider()
          provider.setCustomParameters({ prompt: 'select_account' })
          break
        }

        case 'github':
          provider = new GithubAuthProvider()
          provider.addScope('repo')
          provider.setCustomParameters({
            allow_signup: 'false',
          })
          break
        default:
          throw new Error('Invalid signin type')
      }

      return signInWithPopup(auth, provider)
        .then(async (cred) => {
          const res = await updateThirdPartyUserFromAccountInvite(
            httpClient,
            cred,
            token
          )
          trackEvent(LOGIN_SUCCESS, {
            ...res,
            inviteToken: token,
          })
          return res
        })
        .catch((err) => {
          handleError(err)
        })
    },
    { onSuccess: config?.onSuccess, onError: config?.onError }
  )
}

function handleError(err) {
  if (err instanceof FirebaseError) {
    switch (err.code) {
      case 'auth/invalid-email':
      case 'auth/user-not-found':
      case 'auth/wrong-password':
        throw new Error('Incorrect email or password')
      case 'auth/user-disabled':
        throw new Error('Your account has been disabled')
      default:
        throw new Error('An unknown error occurred')
    }
  } else {
    throw new Error('An unknown error occurred')
  }
}

async function updateThirdPartyUser(
  httpClient: AxiosInstance,
  userCred: UserCredential
): Promise<ThirdPartyAuthResponseDto> {
  const body: ThirdPartyAuthDto = {
    authUid: userCred.user.uid,
    email: userCred.user.email!,
    providerId: userCred.providerId,
    profilePictureUrl: userCred.user.photoURL,
  }
  const response = await httpClient.post(`/auth/third-party`, body)
  const result = response.data as ThirdPartyAuthResponseDto
  return result
}

async function updateThirdPartyUserFromAccountInvite(
  httpClient: AxiosInstance,
  userCred: UserCredential,
  accountInviteToken: string
): Promise<ThirdPartyAuthResponseDto> {
  const body: ThirdPartyAuthAccountInviteDto = {
    authUid: userCred.user.uid,
    providerId: userCred.user.providerId,
    email: userCred.user.email!,
    token: accountInviteToken,
  }
  console.debug('SENDING BODY: ', { body })
  const response = await httpClient.post(
    `/auth/third-party/account-invite`,
    body
  )
  const result = response.data as ThirdPartyAuthResponseDto
  return result
}
