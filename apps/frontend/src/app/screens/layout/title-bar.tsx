import { ReactNode } from 'react'

export function TitleBar({children}: {children: ReactNode}) {
  return (
    <div className="flex flex-row items-center justify-between w-full h-[60px] px-9 bg-white border-b border-b-[#E8EBED]">
      {children}
    </div>
  )
}
