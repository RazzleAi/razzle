import razzle_icon_black from '../../../../assets/images/razzle_icon_black.svg'
import settings_icon from '../../../../assets/images/settings_icon.svg'
import help_icon from '../../../../assets/images/help_icon.svg'
import { ReactNode } from 'react'
import { Divider } from '../../../components/divider'
import { AiOutlineAppstoreAdd } from 'react-icons/ai'
import { Tooltip } from 'flowbite-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { FaDiscord } from 'react-icons/fa'

export function LeftPaneButtonBar() {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col px-3 pt-4 pb-6 align-middle items-center bg-white border-r border-[#E8EBED] ">
      <div className="flex mb-4">
        {/* <IconButton>
          <img alt="buttonIcon" src={razzle_icon_black} className="w-4 h-5" />
        </IconButton> */}
      </div>
      {/* <div className="flex w-full px-1">
        <Divider />
      </div> */}
      {/* <PlusIcon /> */}
      <div className="flex flex-grow"></div>
      <div className="flex flex-col gap-3">
        {/* <Tooltip placement="right" content="Settings">
          <IconButton>
            <img alt="buttonIcon" src={settings_icon} className="w-5 h-5" />
          </IconButton>
        </Tooltip>
        <Tooltip placement="right" content="Help">
          <IconButton>
            <img alt="buttonIcon" src={help_icon} className="w-5 h-5" />
          </IconButton>
        </Tooltip> */}

        <DiscordLink />
      </div>
    </div>
  )
}

function DiscordLink() {
  return (
    <Tooltip placement="right" content="Join us on Discord">
      <a
        className="flex flex-row rounded-[50%] shadow-md bg-[#5865F2] hover:bg-[#313cbc] transition-colors p-3"
        href="https://discord.gg/TzRt9wQM5u"
        target="_blank"
        rel="noreferrer"
      >
        <FaDiscord color="white" size={28} />
      </a>
    </Tooltip>
  )
}

function IconButton({
  children,
  active,
  onClick,
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`flex flex-row justify-center items-center w-[50px] h-[50px] rounded-[50%] ${
        active ? 'bg-[#ABABAB]' : 'bg-[#E8EBED]'
      } cursor-pointer shadow-sm transition-all ease-in hover:bg-[#ABABAB]`}
    >
      <div
        className={`flex flex-row justify-center items-center w-[45px] h-[45px] rounded-[50%] ${
          active ? 'bg-[#E8EBED]' : 'bg-white'
        } cursor-pointer shadow-sm transition-all ease-in hover:bg-[#E8EBED]`}
      >
        {children}
      </div>
    </div>
  )
}

function PlusIcon() {
  return (
    <div className="cursor-pointer flex">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        className="w-6 h-6 stroke-[#ABABAB]"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
    </div>
  )
}
