import { useEffect } from 'react'

/** Warn when leaving/reloading during an active game. */
export function useBeforeUnload(active: boolean, message: string): void {
  useEffect(() => {
    if (!active) return
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault()
      e.returnValue = message
      return message
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [active, message])
}
