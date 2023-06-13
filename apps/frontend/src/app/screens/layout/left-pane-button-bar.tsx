import { ReactNode } from 'react'
import { Tooltip } from 'flowbite-react'
import { FaDiscord } from 'react-icons/fa'

export function LeftPaneButtonBar() {
  return (
    <div className="flex flex-col px-3 pt-4 pb-6 align-middle items-center bg-white border-r border-[#E8EBED] ">
      <div className="flex mb-4"></div>
      <div className="flex flex-grow"></div>
      <div className="flex flex-col gap-3">
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
