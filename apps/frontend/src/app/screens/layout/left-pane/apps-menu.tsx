import { AiOutlineAppstore } from 'react-icons/ai'
import { useLocation, useNavigate } from 'react-router-dom'
import { APPS_MENU_CLICKED } from '../../../events'
import { useEventTracker } from '../../../mixpanel'

export function AppsMenu() {
  const navigate = useNavigate()
  const location = useLocation()
  const { trackEvent } = useEventTracker()
  const isActive = location.pathname.includes('/apps')

  return (
    <div
      className={`flex flex-col cursor-pointer w-full py-3 hover:bg-[#F6F5F6] transition-colors duration-500 border-l-[3px] ${
        isActive ? 'border-lavenderBlue' : 'border-transparent'
      }`}
      onClick={(e) => {
        e.preventDefault()
        trackEvent(APPS_MENU_CLICKED)
        navigate('apps')
      }}
    >
      <div className="group flex flex-row items-center gap-2 w-full cursor-pointer px-5">
        <div className="flex flex-row items-center font-medium text-base">
          <AiOutlineAppstore size={20} className="w-5 h-5 mr-4 text-gray-700" />
          <span className="text-gray-700">Apps</span>
        </div>
      </div>
    </div>
  )
}
