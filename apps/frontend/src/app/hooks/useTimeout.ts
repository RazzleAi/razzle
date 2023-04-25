import { useCallback, useEffect, useRef } from 'react'

// usage: const { clear, reset } = useTimeout(() => setCount(0), 1000)
export function useTimeout(callback: () => any, delay: number) {
  const callbackRef = useRef(callback)
  const timeoutRef = useRef<any>()

  useEffect(() => {
    callbackRef.current = callback
  }, [callback])

  const set = useCallback(() => {
    timeoutRef.current = setTimeout(() => callbackRef.current(), delay)
  }, [delay])

  const clear = useCallback(() => {
    timeoutRef.current = clearTimeout(timeoutRef.current)
  }, [])

  useEffect(() => {
    set()
    return clear
  }, [delay, set, clear])

  const reset = useCallback(() => {
    clear()
    set()
  }, [clear, set])

  return {reset, clear}
}
