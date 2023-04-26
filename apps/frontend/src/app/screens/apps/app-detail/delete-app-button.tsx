import { useNavigate, useParams } from "react-router-dom"
import { DELETE_APP_CLICKED } from "../../../events"
import { useDeleteApp } from "../../queries"
import ConfirmDeleteModal from "./confirm-delete-modal"
import { useEventTracker } from "../../../mixpanel"
import { AppDto } from "@razzle/dto"
import { useState } from "react"

export function DeleteAppButton({ app }: { app?: AppDto }) {
    const { accountId } = useParams()
    const { trackEvent } = useEventTracker()
    const navigate = useNavigate()
    const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false)
    const { mutateAsync: deleteApp } = useDeleteApp()
  
    function deleteAppClicked(e: React.MouseEvent<HTMLButtonElement>) {
      setConfirmDeleteOpen(true)
      trackEvent(DELETE_APP_CLICKED, { ...app })
    }
  
    return (
      <>
        {confirmDeleteOpen && (
          <ConfirmDeleteModal
            app={app}
            open={confirmDeleteOpen}
            setOpen={setConfirmDeleteOpen}
            deleteClicked={async () => {
              await deleteApp(app.id)
              navigate(`/accounts/${accountId}/apps`)
            }}
          />
        )}
        <button
          className="mt-5 bg-white shadow sm:rounded-lg"
          onClick={deleteAppClicked}
        >
          <div className="px-4 py-5 sm:p-6 font-semibold text-red-700">
            Delete {app.name}
          </div>
        </button>
      </>
    )
  }
  