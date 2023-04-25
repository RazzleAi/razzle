import React, { useContext, useEffect, useRef } from 'react'

interface HotKeyToComponentMap {
  componentName: string
  hotKey: string
  includeMetaKey: boolean
  queueNumber: number
  instanceId?: string
}

export const HotKeyStack = React.createContext<HotKeyToComponentMap[]>([])

export function useHotKeys(args: {
  key: string
  componentName: string
  includeMetaKey: boolean
  callback: () => void
  instanceId?: string
}) {
  const callbackRef = useRef(args.callback)
  callbackRef.current = args.callback

  const escStackContext = useContext<HotKeyToComponentMap[]>(HotKeyStack)

  if (escStackContext === undefined) {
    throw new Error('useHotKeys must be used within a EscapeStack.Provider')
  }

  useEffect(() => {
    escStackContext.push({
      componentName: args.componentName,
      hotKey: args.key,
      includeMetaKey: args.includeMetaKey,
      queueNumber: escStackContext.length,
      instanceId: args.instanceId,
    })

    function handle(event: KeyboardEvent) {
      if (args.key !== event.key) {
        return
      }

      const commmandStack = escStackContext
        .filter((hotKeyMap) => {
          return (
            hotKeyMap.hotKey === args.key &&
            hotKeyMap.includeMetaKey === args.includeMetaKey
          )
        })
        .sort((a, b) => a.queueNumber - b.queueNumber)

      let lastComponentInStack

      if (commmandStack.length === 1) {
        lastComponentInStack = commmandStack[commmandStack.length - 1]
      } else if (commmandStack.length > 1) {
        if (!args.instanceId) return

        lastComponentInStack = commmandStack.find(
          (hotKeyMap) => hotKeyMap.instanceId === args.instanceId
        )
      }

      // if the top element is not the current component, don't do anything
      if (lastComponentInStack?.componentName !== args.componentName) {
        return
      }

      console.log({ lastComponentInStack })
      console.log({ args })

      if (
        args.key === event.key &&
        (!args.includeMetaKey || event.metaKey || event.ctrlKey)
      ) {
        event.preventDefault()
        callbackRef.current()
      }
    }

    document.addEventListener('keydown', handle)
    return () => {
      document.removeEventListener('keydown', handle)
      escStackContext.pop()
    }
  }, [])
}
