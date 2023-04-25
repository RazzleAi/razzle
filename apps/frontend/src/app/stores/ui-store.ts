import create from 'zustand'
import { devtools } from 'zustand/middleware'

export interface UiStore {
  showToast: boolean
  toastMessage?: string
  setToast: (toastMessage: string) => void
  clearToast: () => void
}

export const useUiStore = create<UiStore>()(
  devtools((set, get) => ({
    showToast: false,
    toastMessage: undefined,
    setToast: (toastMessage: string) => {
      set((state) => ({ ...state, showToast: true, toastMessage }))
    },
    clearToast: () => {
      set((state) => ({ ...state, showToast: false, toastMessage: undefined }))
    },
  }))
)
