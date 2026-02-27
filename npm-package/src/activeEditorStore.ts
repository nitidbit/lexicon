import { useReducer, useEffect } from 'react'

/**
 * Global store to coordinate which lexicon editor is open across multiple LxProviders.
 * When one editor opens, other edit buttons become disabled until it closes.
 */
let activeEditorId: string | null = null
const listeners = new Set<() => void>()

export const setActiveEditor = (id: string | null) => {
  activeEditorId = id
  listeners.forEach((l) => l()) // force update all listeners (so each edit-lexicon-btn re-renders)
}

export const getActiveEditorId = (): string | null => {
  return activeEditorId
}

export const useActiveEditorSubscription = () => {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0)

  useEffect(() => {
    listeners.add(forceUpdate)

    return () => {
      listeners.delete(forceUpdate)
    }
  }, [])
}
