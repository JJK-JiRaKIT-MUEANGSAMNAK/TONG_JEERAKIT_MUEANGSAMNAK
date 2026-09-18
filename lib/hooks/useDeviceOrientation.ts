'use client'

import { useState, useEffect, useRef } from 'react'

export type DeviceOrientation = 'portrait' | 'landscape'

export function getDeviceOrientation(): DeviceOrientation {
  if (typeof window === 'undefined') return 'portrait'

  // 1. Screen Orientation API (Modern standard, iOS 16.4+, Chrome, Safari)
  const screenType = window.screen?.orientation?.type
  if (typeof screenType === 'string') {
    if (screenType.startsWith('portrait')) return 'portrait'
    if (screenType.startsWith('landscape')) return 'landscape'
  }

  // 2. Deprecated window.orientation / angle (Supported on iPad Safari)
  const angle = typeof window.screen?.orientation?.angle === 'number'
    ? window.screen.orientation.angle
    : (typeof (window as unknown as { orientation?: number }).orientation === 'number'
      ? (window as unknown as { orientation: number }).orientation
      : undefined)

  if (typeof angle === 'number') {
    if (Math.abs(angle) === 90) return 'landscape'
    if (angle === 0 || angle === 180) return 'portrait'
  }

  // 3. Fallback to physical screen dimensions (independent of virtual keyboard)
  if (window.screen && typeof window.screen.width === 'number' && typeof window.screen.height === 'number') {
    return window.screen.width > window.screen.height ? 'landscape' : 'portrait'
  }

  return 'portrait'
}

export function useStableOrientationHeight(): {
  orientation: DeviceOrientation
  stableHeight: number | null
} {
  const [orientation, setOrientation] = useState<DeviceOrientation>('portrait')
  const [stableHeight, setStableHeight] = useState<number | null>(null)
  const heightCache = useRef<Partial<Record<DeviceOrientation, number>>>({})

  useEffect(() => {
    const update = () => {
      const currentOrientation = getDeviceOrientation()
      setOrientation(currentOrientation)

      // Measure height ONLY when orientation changes or on initial mount.
      // This guarantees the height is measured when the virtual keyboard is NOT active,
      // and will not be affected by virtual keyboard resize events.
      if (typeof window !== 'undefined') {
        const h = window.innerHeight
        if (h > 300) {
          heightCache.current[currentOrientation] = h
          setStableHeight(h)
        } else if (heightCache.current[currentOrientation]) {
          setStableHeight(heightCache.current[currentOrientation]!)
        }
      }
    }

    // Initial measurement
    update()

    const screenOrientation = window.screen?.orientation
    const handleScreenChange = () => {
      update()
      setTimeout(update, 150)
    }

    if (screenOrientation?.addEventListener) {
      screenOrientation.addEventListener('change', handleScreenChange)
    }

    // On iOS Safari, innerHeight updates slightly after orientationchange fires
    const handleOrientationChange = () => {
      update()
      setTimeout(update, 150)
      setTimeout(update, 300)
    }

    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      if (screenOrientation?.removeEventListener) {
        screenOrientation.removeEventListener('change', handleScreenChange)
      }
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return { orientation, stableHeight }
}

export function useDeviceOrientation(): DeviceOrientation {
  const { orientation } = useStableOrientationHeight()
  return orientation
}
