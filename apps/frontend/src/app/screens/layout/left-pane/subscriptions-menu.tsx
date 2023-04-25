import { Disclosure } from '@headlessui/react'
import { AiFillCaretRight } from 'react-icons/ai'
import { HiOutlineMegaphone } from 'react-icons/hi2'

export function SubscriptionsMenu() {
  return (
    <Disclosure as="div">
      {({ open }) => (
        <div className="flex flex-col w-full">
          <Disclosure.Button as="div">
            <div className="flex flex-row items-center gap-2 w-full cursor-pointer px-5">
              <AiFillCaretRight
                className={
                  'flex w-4 h-4 fill-[#5C5C5C] transition-transform ' +
                  (open ? 'rotate-90 transform' : '')
                }
              />
              <div className="flex flex-row items-center font-medium text-base">
                <HiOutlineMegaphone color="#5C5C5C" className="mr-4 w-5 h-5" />
                <span className="text-[#5C5C5C]">Subscriptions</span>
              </div>
            </div>
          </Disclosure.Button>
          <Disclosure.Panel as="div">
            <div className="flex flex-col w-full pt-2">
              <div className="flex flex-row items-center w-full gap-2 px-6 text-[#0F0F0F] hover:bg-[#F6F5F6] cursor-pointer">
                <p className="text-sm py-3 text-ellipsis">Coming soon</p>
              </div>
            </div>
          </Disclosure.Panel>
        </div>
      )}
    </Disclosure>
  )
}
