import { AccountDto } from '@razzle/dto'
import { useCallback, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { PrimaryButton } from '../../components/buttons'
import { Spinner } from '../../components/spinners'
import { useFirebaseServices } from '../../firebase'
import { useGetAccounts } from '../queries'

export function AccountListPage() {
  const { currentUser } = useFirebaseServices()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { isLoading: isLoadingAccounts, data: accounts } = useGetAccounts()

  const onAccountSelected = useCallback(
    (account: AccountDto) => {
      navigate(`/accounts/${account.id}`)
    },
    [navigate]
  )

  useEffect(() => {
    if (!accounts) {
      return
    }

    if (accounts.length === 0) {
      navigate('create')
      return
    }

    if (accounts.length === 1 && searchParams.get('login') === 'true') {
      onAccountSelected(accounts[0])
      return
    }
  }, [accounts, navigate, onAccountSelected, searchParams])

  return (
    <div className="flex flex-col w-[500px] h-full justify-center">
      {isLoadingAccounts ? (
        <div className="flex flex-col w-full h-full items-center justify-center">
          <Spinner size="small" thumbColorClass="fill-electricIndigo-500" />
        </div>
      ) : (
        <div className="flex flex-col w-full  border border-[#ececec] rounded shadow-xl px-5 py-5">
          <div className="flex flex-row justify-between items-center grow pb-3 border-[#E8EBED] border-b">
            <h3 className="flex font-semibold text-[24px]">Your Accounts</h3>
            <span className="font-medium text-[15px] text-[#5C5C5C]">
              {currentUser?.email}
            </span>
          </div>

          {accounts &&
            accounts.map((account) => (
              <div
                key={account.id}
                className="flex flex-row justify-between items-center grow pb-5 pt-5 border-[#E8EBED] border-b last:border-none"
              >
                <div
                  className="flex flex-col items-start gap-1"
                  key={account.id}
                >
                  <h3 className="font-semibold text-[18px]">{account.name}</h3>
                  <span className="font-medium text-[12px] text-[#5C5C5C]">
                    {account.memberCount}{' '}
                    {account.memberCount === 1 ? 'member' : 'members'}
                  </span>
                </div>
                <PrimaryButton
                  text="Launch team"
                  onClick={() => onAccountSelected(account)}
                />
              </div>
            ))}
        </div>
      )}
      {!isLoadingAccounts && (
        <div className="flex flex-row mt-4 w-full">
          <PrimaryButton
            fullWidth={true}
            tall={true}
            text="Create a new account"
            onClick={() => {
              navigate('create')
            }}
          />
        </div>
      )}
    </div>
  )
}
