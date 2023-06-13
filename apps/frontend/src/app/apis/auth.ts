import { UserCredential } from 'firebase/auth'
import { AxiosInstance } from 'axios'
import {
  ThirdPartyAuthAccountInviteDto,
  ThirdPartyAuthDto,
  ThirdPartyAuthResponseDto,
} from '@razzle/dto'

export async function updateThirdPartyUserFromAccountInvite(
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

export async function updateThirdPartyUser(
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
