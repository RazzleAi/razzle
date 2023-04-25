import { useNavigate, useSearchParams } from 'react-router-dom'
import { SigninType, useDoThirdPartySigninFromAccountInvite } from './api'
import Log from '../../utils/logger'
import logo_black from '../../../assets/images/razzle_logo_black.svg'
import { AiOutlineGithub, AiOutlineGoogle } from 'react-icons/ai'
import { useEventTracker } from '../../mixpanel'
import { LOGIN_CLICKED, LOGIN_FAILED } from '../../events'

export function AccountUserInvitePage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get('token')
  Log.info('token: ' + token)
  const { isLoading, mutate } = useDoThirdPartySigninFromAccountInvite(token, {
    onError: onSigninError,
    onSuccess: () => {
      navigate('/accounts?login=true')
    },
  })
  const { trackEvent } = useEventTracker()

  function loginClicked(provider: SigninType) {
    trackEvent(LOGIN_CLICKED, {
      provider: provider as string,
      inviteToken: token,
    })
    mutate(provider)
  }

  function onSigninError(err: any, variable: SigninType, context: any) {
    trackEvent(LOGIN_FAILED, {
      provider: variable as string,
      inviteToken: token,
    })
  }

  return (
    <div className="flex flex-col items-center justify-start bg-[#f1ecfd] w-full h-[100vh]">
      <div className="flex items-center justify-between flex-row w-full h-24 py-5 px-14 bg-white">
        <img className="h-7" src={logo_black} alt="Razzle logo" />
      </div>

      <div className="flex flex-col w-full h-full items-center justify-center">
        <h5 className="font-semibold text-2xl text-gray-600">
          Welcome to Razzle
        </h5>
        {/* <p>{isLoading ? 'Loading...' : ''}</p> */}

        <div className="flex flex-col gap-5 mt-6 w-72">
          <button
            type="button"
            onClick={() => loginClicked('google')}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-white px-4 py-4 text-base font-medium text-gray-500 shadow-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200 focus:ring-offset-2"
          >
            <AiOutlineGoogle size={22} className="mr-2" />
            Continue with Google
          </button>
          <button
            type="button"
            onClick={() => loginClicked('github')}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-gray-600 px-4 py-4 text-base font-medium text-white shadow-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-colors duration-200 focus:ring-offset-2"
          >
            <AiOutlineGithub size={22} className="mr-2" />
            Continue with Github
          </button>          
        </div>
      </div>
    </div>
  )
}
