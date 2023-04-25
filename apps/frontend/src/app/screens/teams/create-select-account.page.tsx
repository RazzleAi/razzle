import { TopBar } from '../../components/top-bar'
import { AccountListPage } from './account-list.page'

export function AccountsLayout() {
  return (
    <div className="flex flex-col items-center bg-[#F9FAFB] w-full h-[100vh]">
      <TopBar />
      <div className="w-full h-full flex flex-col items-center bg-white">
      <AccountListPage />
      </div>
    </div>
  )
}
