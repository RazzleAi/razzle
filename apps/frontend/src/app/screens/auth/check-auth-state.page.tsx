import { onAuthStateChanged } from 'firebase/auth'
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Spinner } from '../../components/spinners'
import { useFirebaseServices } from '../../firebase'

export function CheckAuthStatePage() {
  const navigate = useNavigate()
  const { auth } = useFirebaseServices()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currUser) => {
      if (!currUser) {
        navigate('/login')
      } else {
        navigate('/accounts')
      }
    })
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <Spinner size="medium" thumbColorClass="fill-electricIndigo-500" />
    </div>
  )
}
