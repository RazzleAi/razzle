import { Combobox, Dialog, Transition } from '@headlessui/react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { UserDto, WorkspaceDto } from '@razzle/dto'
import { Fragment, useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { ErrorDisplay } from '../../components/error-display'
import { Spinner } from '../../components/spinners'
import { useDebouncedValue } from '../../hooks'
import { useEventTracker } from '../../mixpanel'
import {
  useAddWorkspaceMembers,
  useGetAllWorkspaceMembers,
  useSearchUsers,
} from '../queries'

export default function AddUserToWorkspaceModal(props: {
  onClose?: () => void
  workspace: WorkspaceDto
  accountId: string
}) {
  const [open, setOpen] = useState(true)
  const cancelButtonRef = useRef(null)

  const [selectedUsers, setSelectedUsers] = useState<UserDto[]>([])

  const { register, handleSubmit, watch } = useForm({
    defaultValues: {
      searchQuery: '',
    },
  })

  const searchQuery = watch('searchQuery')
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 200)

  const {
    data: searchedUsers,
    isLoading: isSearching,
    refetch: searchForUser,
  } = useSearchUsers(props.accountId, searchQuery, { enabled: false })

  const { data: workspaceMembers } = useGetAllWorkspaceMembers(
    props.workspace.id,
    { enabled: true }
  )

  const {
    isLoading: isSubmitting,
    isError,
    error,
    mutate,
  } = useAddWorkspaceMembers({ onSuccess: onWorkspaceMembersAdded })
  const { trackEvent } = useEventTracker()

  useEffect(() => {
    if (!open) {
      props?.onClose?.()
    }
  }, [open, props])

  useEffect(() => {
    searchForUser()
  }, [debouncedSearchQuery, searchForUser])

  const filteredUsers = searchedUsers?.filter((u) => {
    return (
      !workspaceMembers?.find((m) => m.userId === u.id) &&
      !selectedUsers.find((s) => s.id === u.id)
    )
  })

  function onSubmit() {
    if (selectedUsers.length === 0) return

    mutate({
      workspaceId: props.workspace.id,
      dto: { userIds: selectedUsers.map((u) => u.id) },
    })
  }

  function onWorkspaceMembersAdded() {
    setOpen(false)
  }

  function userSelected(user: UserDto) {
    console.debug('user selected', user)
    setSelectedUsers([...selectedUsers, user])
  }

  function onUserRemoved(user: UserDto) {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id))
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
                  method="POST"
                  action="#"
                  className="flex flex-col bg-white"
                >
                  <div className="h-0 flex-1 overflow-y-auto">
                    <div className="bg-electricIndigo-500 py-6 px-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <Dialog.Title className="text-lg font-medium text-white">
                          Add users
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="rounded-md bg-electricIndigo-500 text-gray-100 hover:text-white focus:outline-none focus:ring-0 focus:ring-white"
                            onClick={() => setOpen(false)}
                          >
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                      <div className="mt-1">
                        <p className="text-sm text-gray-300">
                          #{props.workspace.name}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col justify-between px-4  sm:p-6 sm:pb-4 space-y-6 pt-6 pb-5">
                    <ErrorDisplay isError={isError} error={error} title="" />
                    <div className="pb-2">
                      <Combobox onChange={userSelected}>
                        <Combobox.Input
                          as={Fragment}
                          onChange={(e) => void null}
                          displayValue={(user) => ''}
                        >
                          <div className="relative mt-1 rounded-md shadow-sm">
                            <input
                              {...register('searchQuery', {
                                required: false,
                              })}
                              type="text"
                              autoComplete="off"
                              className="block w-full rounded-md border-gray-300 pr-10 focus:border-none focus:ring-0 border-none ring-0 sm:text-sm"
                              placeholder='E.g. "johndoe@gmail.com"'
                            />
                            {isSearching ? (
                              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                                <Spinner
                                  size="small"
                                  thumbColorClass="fill-electricIndigo-500"
                                  aria-hidden="true"
                                />
                              </div>
                            ) : undefined}
                          </div>
                        </Combobox.Input>
                        <Combobox.Options as={Fragment}>
                          <div className="absolute left-0 right-0 w-auto flex flex-col text-xs text-gray-600 bg-white divide-y border border-gray-200 rounded-md -mt-1 mx-4 shadow-md">
                            {filteredUsers && filteredUsers.length === 0 ? (
                              <Combobox.Option
                                as="div"
                                className="flex flex-col cursor-pointer rounded-sm py-2 px-2  hover:bg-gray-100"
                                key={'no-value'}
                                value={null}
                              >
                                No matches found
                              </Combobox.Option>
                            ) : undefined}
                            {filteredUsers && filteredUsers.length > 0
                              ? filteredUsers?.map((user) => (
                                  <Combobox.Option
                                    as="div"
                                    className="flex flex-row items-center gap-3 cursor-pointer rounded-sm py-2 px-2 hover:bg-gray-100"
                                    key={user.id}
                                    value={user}
                                  >
                                    <img
                                      className="inline-block h-6 w-6 rounded-full"
                                      src={user.profilePictureUrl}
                                      referrerPolicy="no-referrer"
                                      alt=""
                                    />
                                    <span>{user.email}</span>
                                  </Combobox.Option>
                                ))
                              : undefined}
                          </div>
                        </Combobox.Options>
                      </Combobox>
                    </div>
                    <div className="flex flex-col space-y-2">
                      <SelectedUsersDisplay
                        users={selectedUsers}
                        onRemove={onUserRemoved}
                      />
                    </div>
                  </div>
                  <div className="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
                    <button
                      type="submit"
                      className="inline-flex w-full justify-center rounded-md border border-transparent bg-electricIndigo-500 disabled:bg-gray-400 disabled:hover:bg-gray-400 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-electricIndigo-600 focus:outline-none focus:ring-2 focus:ring-electricIndigo-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm"
                      disabled={selectedUsers.length === 0}
                    >
                      {isSubmitting ? (
                        <Spinner
                          size="small"
                          thumbColorClass="fill-electricIndigo-500"
                        />
                      ) : (
                        'Done'
                      )}
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

function SelectedUsersDisplay(props: {
  users: UserDto[]
  onRemove?: (user: UserDto) => void
}) {
  return (
    <div className="flex flex-row flex-wrap gap-1">
      {props.users.map((user) => (
        <div className="flex flex-row items-center gap-1 text-xs text-gray-700 bg-gray-200 py-2 px-3 rounded-2xl">
          <img
            className="inline-block h-6 w-6 rounded-full"
            src={user.profilePictureUrl}
            referrerPolicy="no-referrer"
            alt=""
          />
          <span>{user.email}</span>
          <button
            type="button"
            className="flex rounded-md bg-transparent text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-0"
            onClick={() => {
              props?.onRemove?.(user)
            }}
          >
            <span className="sr-only">Close panel</span>
            <XMarkIcon className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </div>
      ))}
    </div>
  )
}
