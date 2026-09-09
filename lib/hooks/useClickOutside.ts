import { useEffect, RefObject } from 'react'

type AnyRef = RefObject<HTMLElement | null> | HTMLElement | null

/**
 * Hook to detect clicks/taps outside of the specified element(s).
 * Uses pointerdown to seamlessly support mouse, touch (iPad / Mobile), and stylus.
 */
export function useClickOutside(
  refOrRefs: AnyRef | AnyRef[],
  handler: (event: PointerEvent | MouseEvent | TouchEvent) => void,
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return

    const listener = (event: PointerEvent) => {
      const refs = Array.isArray(refOrRefs) ? refOrRefs : [refOrRefs]
      const target = event.target as Node | null

      if (!target) return

      const isInside = refs.some((r) => {
        const el = r && 'current' in r ? r.current : (r as HTMLElement | null)
        return el && el.contains(target)
      })

      if (!isInside) {
        handler(event)
      }
    }

    document.addEventListener('pointerdown', listener, true)
    return () => {
      document.removeEventListener('pointerdown', listener, true)
    }
  }, [refOrRefs, handler, enabled])
}
