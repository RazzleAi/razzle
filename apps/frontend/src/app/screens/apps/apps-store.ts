import { CreateAppResponseDto } from '@razzle/dto'
import create from 'zustand'
import { devtools } from 'zustand/middleware'

export interface AppPagesStore {
  createAppResponse?: CreateAppResponseDto
  setCreateAppResponse: (createAppResponse: CreateAppResponseDto) => void
  clearCreateAppResponse: () => void
}

export const useAppPagesStore = create<AppPagesStore>()(
  devtools((set, get) => ({
    createAppResponse: undefined,
    setCreateAppResponse: (createAppResponse: CreateAppResponseDto) => {
      set((state) => ({ ...state, createAppResponse }))
    },
    clearCreateAppResponse: () => {
      set((state) => ({ ...state, createAppResponse: undefined }))
    },
  }))
)
