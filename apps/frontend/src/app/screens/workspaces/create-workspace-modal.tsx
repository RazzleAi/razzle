import { Fragment, useEffect, useRef, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useForm } from 'react-hook-form'
import { useAppStore } from '../../stores/app-store'
import { Spinner } from '../../components/spinners'
import { ErrorDisplay } from '../../components/error-display'
import { CreateWorkspaceResponseDto } from '@razzle/dto'
import { useCreateWorkspace } from '../queries'

export default function CreateWorkspaceModal(props?: { onClose?: () => void }) {
  const [open, setOpen] = useState(true)
  const cancelButtonRef = useRef(null)
  const { account } = useAppStore()

  const {
    register,
    handleSubmit,
    formState: { errors: validationErrors },
  } = useForm({
    defaultValues: {
      name: '',
      description: undefined,
    },
  })

  const {
    isLoading: isSubmitting,
    isError,
    error,
    mutate,
  } = useCreateWorkspace({
    onSuccess: onWorkspaceCreated,
  })

  useEffect(() => {
    if (!open) {
      props?.onClose?.()
    }
  }, [open])

  function onSubmit(data: { name: string; description?: string }) {
    if (!account) return

    mutate({
      accountId: account.id,
      ...data,
    })
  }

  function onWorkspaceCreated(resp: CreateWorkspaceResponseDto) {
    // trackEvent(CREATE_WORKSPACE_SUCCESS, { ...resp })
    setOpen(false)
  }

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        initialFocus={cancelButtonRef}
        onClose={setOpen}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
                <form
                  onSubmit={handleSubmit(onSubmit)}
                  className="flex flex-col bg-white"
                >
                  <div className="h-0 flex-1 overflow-y-auto">
                    <div className="bg-electricIndigo-500 py-6 px-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-lg font-medium text-white">
                          New Workspace
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-electricIndigo-500 text-gray-100 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-gray-300">
                          Please fill in the information below to create your
                          new workspace.
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between px-4  sm:p-6 sm:pb-4 space-y-6 pt-6 pb-5">
                    <ErrorDisplay isError={isError} error={error} title="" />
                    <div>
                      <label
                        htmlFor="project-name"
                        className="block text-sm font-medium text-gray-600"
                      >
                        Workspace name
                      </label>
                      <div className="mt-1">
                        <input
                          {...register('name', {
                            required: 'The workspace name is required',
                          })}
                          type="text"
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                        {validationErrors.name ? (
                          <span className="text-sm text-red-700">
                            {validationErrors.name?.message}
                          </span>
                        ) : undefined}
                      </div>
                    </div>
                    <div>
                      <label
                        htmlFor="description"
                        className="block text-sm font-medium text-gray-600"
                      >
                        Description
                      </label>
                      <div className="mt-1">
                        <textarea
                          {...register('description', {})}
                          rows={4}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          defaultValue={''}
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-electricIndigo-500 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-electricIndigo-600 focus:outline-none focus:ring-2 focus:ring-electricIndigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                    >
                      {isSubmitting ? (
                        <Spinner
                          size="small"
                          thumbColorClass="fill-electricIndigo-500"
                        />
                      ) : (
                        'Save'
                      )}
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-electricIndigo-500 focus:ring-offset-2 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={() => setOpen(false)}
                      ref={cancelButtonRef}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
