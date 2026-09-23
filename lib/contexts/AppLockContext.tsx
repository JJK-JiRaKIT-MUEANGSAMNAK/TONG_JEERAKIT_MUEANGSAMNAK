'use client'

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react'
import { useAuth } from '@/lib/contexts/AuthContext'
import {
  isPinEnabled as checkPinEnabled,
  savePinCredential,
  verifyPinCredential,
  getAppLockedState,
  setAppLockedState,
} from '@/lib/pin-lock'

export interface AppLockContextType {
  pinEnabled: boolean
  isLocked: boolean
  loading: boolean
  setupPin: (pin: string) => Promise<boolean>
  verifyPin: (pin: string) => Promise<boolean>
  lockApp: () => void
  unlockApp: () => void
  refreshLockState: () => void
}

const AppLockContext = createContext<AppLockContextType>({
  pinEnabled: false,
  isLocked: false,
  loading: true,
  setupPin: async () => false,
  verifyPin: async () => false,
  lockApp: () => {},
  unlockApp: () => {},
  refreshLockState: () => {},
})

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const [pinEnabled, setPinEnabled] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [loading, setLoading] = useState(true)

  const refreshLockState = useCallback(() => {
    if (!user?.id) {
      setPinEnabled(false)
      setIsLocked(false)
      setLoading(false)
      return
    }

    const enabled = checkPinEnabled(user.id)
    setPinEnabled(enabled)

    if (enabled) {
      const lockedInSession = getAppLockedState(user.id)
      setIsLocked(lockedInSession)
    } else {
      setIsLocked(false)
      setAppLockedState(user.id, false)
    }

    setLoading(false)
  }, [user?.id])

  useEffect(() => {
    refreshLockState()
  }, [refreshLockState])

  const setupPin = useCallback(async (pin: string): Promise<boolean> => {
    if (!user?.id) return false
    const ok = await savePinCredential(user.id, pin)
    if (ok) {
      setPinEnabled(true)
      // When user sets up PIN initially, do not automatically lock them out
      setIsLocked(false)
      setAppLockedState(user.id, false)
    }
    return ok
  }, [user?.id])

  const verifyPin = useCallback(async (pin: string): Promise<boolean> => {
    if (!user?.id) return false
    const ok = await verifyPinCredential(user.id, pin)
    if (ok) {
      setIsLocked(false)
      setAppLockedState(user.id, false)
    }
    return ok
  }, [user?.id])

  const lockApp = useCallback(() => {
    if (!user?.id || !pinEnabled) return
    setIsLocked(true)
    setAppLockedState(user.id, true)
  }, [user?.id, pinEnabled])

  const unlockApp = useCallback(() => {
    if (!user?.id) return
    setIsLocked(false)
    setAppLockedState(user.id, false)
  }, [user?.id])

  const value = useMemo<AppLockContextType>(() => ({
    pinEnabled,
    isLocked,
    loading,
    setupPin,
    verifyPin,
    lockApp,
    unlockApp,
    refreshLockState,
  }), [pinEnabled, isLocked, loading, setupPin, verifyPin, lockApp, unlockApp, refreshLockState])

  return (
    <AppLockContext.Provider value={value}>
      {children}
    </AppLockContext.Provider>
  )
}

export function useAppLock(): AppLockContextType {
  const context = useContext(AppLockContext)
  if (!context) {
    throw new Error('useAppLock must be used within an AppLockProvider')
  }
  return context
}
