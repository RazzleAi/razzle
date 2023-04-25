import { StepDto } from '@razzle/dto'
import create from 'zustand'
import { devtools } from 'zustand/middleware'

export interface WorkspacesStateStore {
  steps?: StepDto[]
  isActorPaneOpen: boolean
  showCreateWorkspaceModal: boolean
  showAddUserToWorkspaceModal: boolean
  setSteps: (steps?: StepDto[]) => void
  toggleActorPane: (isActorPaneOpen: boolean) => void
  toggleCreateWorkspaceModal: (showCreateWorkspaceModal: boolean) => void
  toggleAddUserToWorkspaceModal: (showAddUserToWorkspaceModal: boolean) => void
}

export const useWorkspacesStateStore = create<WorkspacesStateStore>()(
  devtools((set, get) => ({
    steps: undefined,
    isActorPaneOpen: false,
    showCreateWorkspaceModal: false,
    showAddUserToWorkspaceModal: false,
    setSteps: (steps?: StepDto[]) => {
      set((state) => ({ ...state, steps: steps }))
    },
    toggleActorPane: (isActorPaneOpen: boolean) => {
      set((state) => ({ ...state, isActorPaneOpen }))
    },
    toggleCreateWorkspaceModal: (showCreateWorkspaceModal: boolean) => {
      set((state) => ({ ...state, showCreateWorkspaceModal }))
    },
    toggleAddUserToWorkspaceModal: (showAddUserToWorkspaceModal: boolean) => {
      set((state) => ({ ...state, showAddUserToWorkspaceModal }))
    },
  }))
)
