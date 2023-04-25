import { AccountDto, AccountWithOwnerDto, MeResponseDto, WorkspaceDto } from '@razzle/dto'
import create from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface AppStore {
  isLoading: boolean
  me?: MeResponseDto
  currentWorkspace?: WorkspaceDto
  account?: AccountWithOwnerDto
  setIsLoading: (isLoading: boolean) => void
  setMe: (me: MeResponseDto) => void
  clearAccount: () => void
  clearCurrentWorkspace: () => void
  setAccount: (account: AccountDto) => void
  setCurrentWorkspace: (workspace: WorkspaceDto) => void
  signout: () => void
}

export const useAppStore = create<AppStore>()(
  persist(
    devtools((set, get) => ({
      isLoading: true,
      me: undefined,
      workspaces: [],
      currentWorkspace: undefined,
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
      clearCurrentWorkspace: () => {
        set((state) => ({ ...state, currentWorkspace: undefined }))
      },
      setCurrentWorkspace: (workspace: WorkspaceDto) => {
        set((state) => ({ ...state, currentWorkspace: workspace }))
      },
      signout: () => {
        set((state) => ({
          ...state,
          me: undefined,
          workspaces: [],
          currentWorkspace: undefined,
          account: undefined,
        }))
      },
    })),
    { name: 'razzle.appStore' }
  )
)
