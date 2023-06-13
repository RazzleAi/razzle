import { AccountDto, AccountWithOwnerDto, MeResponseDto } from '@razzle/dto'
import create from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface AppStore {
  isLoading: boolean
  me?: MeResponseDto
  account?: AccountWithOwnerDto
  setIsLoading: (isLoading: boolean) => void
  setMe: (me: MeResponseDto) => void
  clearAccount: () => void
  setAccount: (account: AccountDto) => void
  signout: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    devtools((set, get) => ({
      isLoading: true,
      me: undefined,
      workspaces: [],
      account: undefined,
      setIsLoading: (isLoading: boolean) => {
        set((state) => ({ ...state, isLoading }))
      },
      setMe: (me: MeResponseDto) => {
        set((state) => ({ ...state, me }))
      },
      setAccount: (account: AccountWithOwnerDto) => {
        set((state) => ({ ...state, account }))
      },
      clearAccount: () => {
        set((state) => ({ ...state, account: undefined }))
      },
      signout: () => {
        set((state) => ({
          ...state,
          me: undefined,
          account: undefined,
        }))
      },
    })),
    { name: 'razzle.appStore' }
  )
)
