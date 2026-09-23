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
  const { user, loading: authLoading } = useAuth()
  const [pinEnabled, setPinEnabled] = useState(false)
  const [isLocked, setIsLocked] = useState(false)
  const [checkedUserId, setCheckedUserId] = useState<string | null | undefined>(undefined)
  const [loading, setLoading] = useState(true)

  const refreshLockState = useCallback(() => {
    if (authLoading) {
      setLoading(true)
      return
    }

    if (!user?.id) {
      setPinEnabled(false)
      setIsLocked(false)
      setCheckedUserId(null)
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

    setCheckedUserId(user.id)
    setLoading(false)
  }, [user?.id, authLoading])

  useEffect(() => {
    refreshLockState()
  }, [refreshLockState])

  const currentUserId = user?.id || null
  const isAppLockLoading = loading || Boolean(authLoading) || (Boolean(currentUserId) && checkedUserId !== currentUserId)

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
    loading: isAppLockLoading,
    setupPin,
    verifyPin,
    lockApp,
    unlockApp,
    refreshLockState,
  }), [pinEnabled, isLocked, isAppLockLoading, setupPin, verifyPin, lockApp, unlockApp, refreshLockState])

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
