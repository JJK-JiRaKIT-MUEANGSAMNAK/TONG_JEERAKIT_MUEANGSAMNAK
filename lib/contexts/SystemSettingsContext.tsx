'use client'

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import {
  SystemConfig,
  DEFAULT_SYSTEM_CONFIG,
  loadSystemSettings,
  saveSystemSettings,
  ActorInfo,
} from '@/lib/settings-storage'
import { checkAndExpireReservations } from '@/lib/bill-workflow-service'

interface SystemSettingsContextValue {
  settings: SystemConfig
  isLoaded: boolean
  updateSettings: (newConfig: SystemConfig, actor: ActorInfo, reason?: string) => Promise<SystemConfig>
  reloadSettings: () => void
}

const SystemSettingsContext = createContext<SystemSettingsContextValue>({
  settings: DEFAULT_SYSTEM_CONFIG,
  isLoaded: false,
  updateSettings: async () => DEFAULT_SYSTEM_CONFIG,
  reloadSettings: () => {},
})

export function SystemSettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<SystemConfig>(DEFAULT_SYSTEM_CONFIG)
  const [isLoaded, setIsLoaded] = useState(false)

  const reloadSettings = useCallback(() => {
    try {
      checkAndExpireReservations()
    } catch {
      // ignore on early boot
    }
    const loaded = loadSystemSettings()
    setSettings(loaded)
    setIsLoaded(true)
  }, [])

  useEffect(() => {
    reloadSettings()

    const handleSettingsChanged = (e: Event) => {
      const customEvent = e as CustomEvent<SystemConfig>
      if (customEvent.detail) {
        setSettings(customEvent.detail)
      } else {
        reloadSettings()
      }
    }

    window.addEventListener('app_settings_changed', handleSettingsChanged)
    window.addEventListener('storage', reloadSettings)

    return () => {
      window.removeEventListener('app_settings_changed', handleSettingsChanged)
      window.removeEventListener('storage', reloadSettings)
    }
  }, [reloadSettings])

  const updateSettings = useCallback(
    async (newConfig: SystemConfig, actor: ActorInfo, reason?: string): Promise<SystemConfig> => {
      const saved = saveSystemSettings(newConfig, actor, reason)
      setSettings(saved)
      return saved
    },
    []
  )

  return (
    <SystemSettingsContext.Provider
      value={{
        settings,
        isLoaded,
        updateSettings,
        reloadSettings,
      }}
    >
      {children}
    </SystemSettingsContext.Provider>
  )
}

export function useSystemSettings() {
  const context = useContext(SystemSettingsContext)
  return context
}
